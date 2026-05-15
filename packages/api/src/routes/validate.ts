import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ValidationResult } from '@semanticraft/parser';
import { ParserService } from '../services/parser.js';

const parserService = new ParserService();

export async function validateRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: { markdown?: string } }>(
    '/',
    async (request: FastifyRequest<{ Querystring: { markdown?: string } }>, reply: FastifyReply) => {
      const { markdown } = request.query;

      if (!markdown) {
        return reply.status(400).send({ valid: false, errors: ['markdown query parameter is required'], warnings: [] });
      }

      try {
        const result: ValidationResult = await parserService.validate(markdown);
        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ valid: false, errors: ['Validation failed'], warnings: [] });
      }
    }
  );
}