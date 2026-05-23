// No telemetry code here. OpenTelemetry is loaded *before* this file by the Node
// preload flag in the start script:
//
//   node --require @opentelemetry/auto-instrumentations-node/register dist/server.js
//
// That register hook configures the SDK and all instrumentations (HTTP, Express,
// winston) from the standard OTEL_* environment variables, and flushes telemetry on
// shutdown — so the application code stays free of any OpenTelemetry imports.
import { app, logger } from './app';

const port = Number(process.env.PORT ?? 8080);
const server = app.listen(port, () => logger.info('http server listening', { port }));

function shutdown(signal: string): void {
  logger.info('shutdown signal received', { signal });
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
