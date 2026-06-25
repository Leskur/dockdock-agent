import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import deployRoutes from './routes/deploy';

interface ServerConfig {
  defaultServerUrl?: string;
}

function getIndexHtml(): Buffer {
  try {
    const sea = require('node:sea');
    if (sea.isSea()) {
      const asset = sea.getRawAsset('public/index.html');
      if (asset) return Buffer.from(asset);
    }
  } catch {}
  return fs.readFileSync(path.join(__dirname, '../public/index.html'));
}

export async function buildServer(config: ServerConfig = {}) {
  const fastify = Fastify({ logger: true });

  const indexHtml = getIndexHtml();

  fastify.get('/', async (_request, reply) => {
    reply.type('text/html').send(indexHtml);
  });

  await fastify.register(deployRoutes, {
    prefix: '/api/v1',
    defaultServerUrl: config.defaultServerUrl,
  });

  return fastify;
}
