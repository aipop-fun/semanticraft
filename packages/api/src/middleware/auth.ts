import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

const API_KEYS = new Set<string>(
  process.env.API_KEYS?.split(',').map((k) => k.trim()) ?? []
);

declare module 'fastify' {
  interface FastifyRequest {
    apiKeyValid?: boolean;
  }
}

export async function apiKeyAuth(fastify: FastifyInstance) {
  fastify.decorateRequest('apiKeyValid', false);

  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url === '/health') return;

      const apiKey = request.headers['x-api-key'] as string | undefined;

      if (!apiKey) {
        return reply.status(401).send({ error: 'Missing X-API-KEY header' });
      }

      if (API_KEYS.size > 0 && !API_KEYS.has(apiKey)) {
        return reply.status(401).send({ error: 'Invalid API key' });
      }

      request.apiKeyValid = true;
    }
  );
}