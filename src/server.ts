import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import deployRoutes from './routes/deploy';

interface ServerConfig {
  defaultServerUrl?: string;
}

export async function buildServer(config: ServerConfig = {}) {
  const fastify = Fastify({ logger: true });

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../public'),
    prefix: '/',
  });

  await fastify.register(deployRoutes, {
    prefix: '/api/v1',
    defaultServerUrl: config.defaultServerUrl,
  });

  return fastify;
}
