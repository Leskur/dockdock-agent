import { randomUUID } from 'crypto';
import { LocalJob } from '../types';
import * as serverService from './server';
import * as dockerService from './docker';

const jobs = new Map<string, LocalJob>();

export function createJob(image: string, tag: string, serverToken?: string): LocalJob {
  const id = randomUUID();
  const job: LocalJob = {
    id,
    image,
    tag,
    serverUrl: 'https://dockdock.baiduapi.com',
    serverToken,
    status: 'pending',
    progress: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(id, job);
  processJob(job);
  return job;
}

export function getJob(id: string): LocalJob | undefined {
  return jobs.get(id);
}

export function getAllJobs(): LocalJob[] {
  return Array.from(jobs.values()).map((job) => ({ ...job }));
}

async function processJob(job: LocalJob) {
  try {
    await dockerService.ensureStorageDir();
    const filePath = dockerService.getStoragePath(job.id);
    job.filePath = filePath;

    job.status = 'requesting';
    job.progress = 10;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    const { id: serverJobId } = await serverService.requestDownload(
      job.image,
      job.tag,
      job.serverToken
    );
    job.serverJobId = serverJobId;

    job.status = 'downloading';
    job.progress = 30;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    await waitForServerReady(serverJobId, job.serverToken);

    job.status = 'loading';
    job.progress = 70;
    job.updatedAt = Date.now();
    jobs.set(job.id, job);

    await serverService.downloadFile(serverJobId, filePath, job.serverToken);
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

async function waitForServerReady(serverJobId: string, token?: string) {
  while (true) {
    const status = await serverService.getServerStatus(serverJobId, token);
    if (status.status === 'ready') break;
    if (status.status === 'failed') {
      throw new Error(`Server failed: ${status.error || 'unknown'}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}
