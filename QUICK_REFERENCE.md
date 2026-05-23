# Quick Reference

## Run

```bash
npm install
npm run stack                       # collector + Tempo + Loki + Prometheus + Grafana
npm run build && npm start          # start includes the --require preload
```

## Test

```bash
curl "http://localhost:8080/hello?name=World"
curl "http://localhost:8080/health"
open http://localhost:3000          # Grafana (admin/admin) → Explore
```

## The whole "setup": a Node preload flag

```bash
node --require @opentelemetry/auto-instrumentations-node/register dist/server.js
```

That's it — the register hook starts the SDK and instruments HTTP, Express, and
winston from `OTEL_*` env vars. The application code imports no OpenTelemetry.

## Application logging

Use a normal winston logger; the auto-instrumentation correlates logs with the
active span and exports them via OTLP:

```ts
logger.info('served request', { route: '/hello' });
```

## Optional: custom spans

You don't need OpenTelemetry imports for HTTP/Express tracing. If you want spans
around your own logic, add `@opentelemetry/api` and:

```ts
import { trace } from '@opentelemetry/api';
await trace.getTracer('my-service').startActiveSpan('doWork', async (span) => {
  try {
    // ...
  } finally {
    span.end();
  }
});
```

## Environment variables

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318   # collector / backend (default)
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf           # or grpc
OTEL_EXPORTER_OTLP_HEADERS=api-key=YOUR_KEY         # hosted backend auth
OTEL_SERVICE_NAME=greeting-service
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1                          # sample 10% of traces
OTEL_METRIC_EXPORT_INTERVAL=5000                     # faster local feedback (ms)
```

## Scripts

```
npm run build / start / dev
npm test / typecheck / lint / format
npm run stack / stack:down
```
