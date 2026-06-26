import { FastifyInstance } from 'fastify';
import * as serverService from '../services/server';

export default async function searchRoutes(fastify: FastifyInstance) {

  fastify.get('/search', async (request, reply) => {
    const { q } = request.query as any;
    if (!q) {
      return reply.status(400).send({ error: 'q is required' });
    }
    return serverService.searchImages(q);
  });

  fastify.get('/tags/:namespace/:repo', async (request, reply) => {
    const { namespace, repo } = request.params as { namespace: string; repo: string };
    const { name } = request.query as any;
    return serverService.listTags(namespace, repo, name);
  });

}
