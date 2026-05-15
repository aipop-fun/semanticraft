import http from 'http';
import { parse } from '@semanticraft/parser';
import { logger, heading } from '../utils/logger.js';

interface ServeCommandOptions {
  port?: number;
}

export async function serveCommand(options: ServeCommandOptions): Promise<void> {
  const port = options.port || 3000;

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    if (req.url === '/parse' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const result = parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  server.listen(port, () => {
    heading('Semanticraft API Server');
    console.log(`  Local:   http://localhost:${port}`);
    console.log(`  Health:   http://localhost:${port}/health`);
    console.log(`  Parse:    POST http://localhost:${port}/parse\n`);
    logger.success(`Server running on port ${port}`);
  });
}