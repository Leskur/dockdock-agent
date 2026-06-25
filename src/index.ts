import 'dotenv/config';
import { buildServer } from './server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8910;
const HOST = process.env.HOST || '0.0.0.0';
const DEFAULT_SERVER_URL = process.env.DEFAULT_SERVER_URL || 'https://dockdock.baiduapi.com';

async function main() {
  const server = await buildServer({ defaultServerUrl: DEFAULT_SERVER_URL });
  await server.listen({ port: PORT, host: HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
