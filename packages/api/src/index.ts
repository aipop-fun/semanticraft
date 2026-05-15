import Fastify from 'fastify';
import { parseRoutes } from './routes/parse.js';
import { validateRoutes } from './routes/validate.js';
import { healthRoutes } from './routes/health.js';
import { apiKeyAuth } from './middleware/auth.js';
import { rateLimitPlugin } from './middleware/rateLimit.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const server = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss Z' },
    },
  },
});

server.addHook('onRequest', async (request) => {
  request.log.info({ method: request.method, url: request.url }, 'request');
});

server.addHook('onResponse', async (request, reply) => {
  request.log.info(
    { method: request.method, url: request.url, statusCode: reply.statusCode },
    'response'
  );
});

server.register(rateLimitPlugin);
server.register(apiKeyAuth);
server.register(parseRoutes, { prefix: '/parse' });
server.register(validateRoutes, { prefix: '/validate' });
server.register(healthRoutes, { prefix: '/health' });

server.get('/', async () => ({ name: '@semanticraft/api', version: '0.1.0-alpha.1' }));

async function start() {
  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();

export { server };