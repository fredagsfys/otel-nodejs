import express from 'express';
import { createLogger, format, transports } from 'winston';

// Structured JSON logger. With the winston auto-instrumentation active, these logs are
// correlated with the request span and exported via OTLP.
export const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [new transports.Console()],
});

// Express requests are instrumented automatically (server span + http.server.*
// metrics), so there is no manual span or metric code in the handlers.
export const app = express();

app.get('/hello', (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name : 'World';
  logger.info('served greeting', { name });
  res.json({ message: `Hello, ${name}!` });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
