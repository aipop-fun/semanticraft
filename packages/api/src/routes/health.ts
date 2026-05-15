import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface HealthResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
}

export async function healthRoutes(fastify: FastifyInstance) {
  const startTime = Date.now();

  fastify.get<{ Reply: HealthResponse }>(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime,
        version: '0.1.0-alpha.1',
      });
    }
  );
}