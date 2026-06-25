import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { LocalJob } from '../types';
import * as serverService from '../services/server';
import * as dockerService from '../services/docker';

interface DeployBody {
  image: string;
  tag?: string;
  serverUrl: string;
  serverToken?: string;
}

const jobs = new Map<string, LocalJob>();

interface DeployOptions {
  defaultServerUrl?: string;
}

export default async function deployRoutes(fastify: FastifyInstance, options: DeployOptions) {
  const defaultServerUrl = options.defaultServerUrl || 'https://dockdock.baiduapi.com';

  fastify.get('/config', async (request, reply) => {
    return { serverUrl: defaultServerUrl };
  });

  fastify.post<{ Body: DeployBody }>('/deploy', async (request, reply) => {
    const { image, serverUrl, serverToken } = request.body;
    const tag = request.body.tag || 'latest';
    if (!image || !serverUrl) {
      return reply.status(400).send({ error: 'image and serverUrl are required' });
    }

    const id = randomUUID();
    const job: LocalJob = {
      id,
      image,
      tag,
      serverUrl,
      serverToken,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    jobs.set(id, job);
    processJob(job, jobs);

    return reply.status(202).send({ id, status: job.status });
  });

  fastify.get('/jobs', async (request, reply) => {
    return Array.from(jobs.values()).map((job) => ({ ...job }));
  });

  fastify.get('/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = jobs.get(id);
    if (!job) {
      return reply.status(404).send({ error: 'job not found' });
    }
    return { ...job };
  });

  fastify.get('/images', async (request, reply) => {
    const images = await dockerService.listImages();
    return images;
  });

  fastify.get('/search', async (request, reply) => {
    const { q, serverUrl, serverToken } = request.query as any;
    if (!q || !serverUrl) {
      return reply.status(400).send({ error: 'q and serverUrl are required' });
    }
    const url = `${serverUrl}/api/v1/images/search?q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: serverToken ? { Authorization: `Bearer ${serverToken}` } : {},
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Search failed: ${res.status} ${text}`);
    }
    return res.json();
  });

  fastify.get('/tags/:namespace/:repo', async (request, reply) => {
    const { namespace, repo } = request.params as { namespace: string; repo: string };
    const { serverUrl, serverToken, name } = request.query as any;
    if (!serverUrl) {
      return reply.status(400).send({ error: 'serverUrl is required' });
    }
    const params = new URLSearchParams();
    if (name && String(name).trim()) {
      params.set('name', String(name).trim());
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `${serverUrl}/api/v1/images/tags/${encodeURIComponent(namespace)}/${encodeURIComponent(repo)}${queryString}`;
    const res = await fetch(url, {
      headers: serverToken ? { Authorization: `Bearer ${serverToken}` } : {},
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Tags failed: ${res.status} ${text}`);
    }
    return res.json();
  });

  fastify.get('/containers', async (request, reply) => {
    const containers = await dockerService.listContainers();
    return containers;
  });
}

async function processJob(job: LocalJob, jobs: Map<string, LocalJob>) {
  try {
    await dockerService.ensureStorageDir();
    const filePath = dockerService.getStoragePath(job.id);
    job.filePath = filePath;

    job.status = 'requesting';
    job.progress = 10;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    const { id: serverJobId } = await serverService.requestDownload(
      job.serverUrl,
      job.image,
      job.tag,
      job.serverToken
    );
    job.serverJobId = serverJobId;

    job.status = 'downloading';
    job.progress = 30;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    await waitForServerReady(job.serverUrl, serverJobId, job.serverToken);

    job.status = 'loading';
    job.progress = 70;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    await serverService.downloadFile(job.serverUrl, serverJobId, filePath, job.serverToken);
    await dockerService.loadImage(filePath);
    await dockerService.removeFile(filePath);
    job.filePath = undefined;

    job.status = 'ready';
    job.progress = 100;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);
  } catch (err) {
    job.status = 'failed';
    job.error = err instanceof Error ? err.message : String(err);
    job.updatedAt = Date.now();
    jobs.set(job.id, job);
  }
}

async function waitForServerReady(serverUrl: string, serverJobId: string, token?: string) {
  while (true) {
    const status = await serverService.getServerStatus(serverUrl, serverJobId, token);
    if (status.status === 'ready') break;
    if (status.status === 'failed') {
      throw new Error(`Server failed: ${status.error || 'unknown'}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}
