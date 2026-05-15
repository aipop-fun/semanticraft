import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

const MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const TIME_WINDOW = process.env.RATE_LIMIT_WINDOW || '1 minute';

export async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: MAX,
    timeWindow: TIME_WINDOW,
    errorResponseBuilder: () => ({
      error: 'Rate limit exceeded',
      message: `Maximum ${MAX} requests per ${TIME_WINDOW} exceeded`,
    }),
  });
}