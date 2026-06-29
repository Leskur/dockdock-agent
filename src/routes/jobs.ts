import { FastifyInstance } from 'fastify';
import * as jobService from '../services/job';
import * as dockerService from '../services/docker';

interface DeployBody {
  image: string;
  tag?: string;
  serverToken?: string;
}

export default async function deployRoutes(fastify: FastifyInstance) {

  fastify.post<{ Body: DeployBody }>('/deploy', async (request, reply) => {
    const { image, serverToken } = request.body;
    const tag = request.body.tag || 'latest';
    if (!image) {
      return reply.status(400).send({ error: 'image is required' });
    }

    const exists = await dockerService.imageExists(image, tag);
    if (exists) {
      return reply.status(200).send({ status: 'exists', message: '镜像已存在，无需下载' });
    }

    const job = jobService.createJob(image, tag, serverToken);
    return reply.status(202).send({ id: job.id, status: job.status });
  });

  fastify.get('/jobs', async (request, reply) => {
    return jobService.getAllJobs();
  });

  fastify.get('/jobs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const job = jobService.getJob(id);
    if (!job) {
      return reply.status(404).send({ error: 'job not found' });
    }
    return { ...job };
  });

}
