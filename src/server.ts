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

// On SIGTERM/SIGINT we only stop accepting connections and let them drain. We do NOT
// call process.exit() here: the OTel preload's own SIGTERM/beforeExit hook runs the
// final telemetry flush, and forcing exit would terminate before that flush completes
// (dropping the last spans/logs/metrics batch). Once the server and SDK release the
// event loop, the process exits naturally.
function shutdown(signal: string): void {
  logger.info('shutdown signal received', { signal });
  server.close(() => logger.info('http server closed'));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
