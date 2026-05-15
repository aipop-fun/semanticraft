import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { LLMContent, ParseOptions } from '@semanticraft/parser';
import { ParserService } from '../services/parser.js';

const parserService = new ParserService();

export async function parseRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: { markdown: string; options?: ParseOptions }; Reply: LLMContent }>(
    '/',
    async (request: FastifyRequest<{ Body: { markdown: string; options?: ParseOptions } }>, reply: FastifyReply) => {
      const { markdown, options } = request.body;

      if (!markdown || typeof markdown !== 'string') {
        return reply.status(400).send({ error: 'markdown field is required and must be a string' });
      }

      if (markdown.length > 1_000_000) {
        return reply.status(413).send({ error: 'markdown exceeds maximum size of 1MB' });
      }

      try {
        const result = await parserService.parse(markdown, options);
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to parse markdown' });
      }
    }
  );
}