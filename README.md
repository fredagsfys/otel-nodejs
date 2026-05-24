# otel-nodejs

A clean, idiomatic **Node.js (TypeScript) + OpenTelemetry** template using
**zero-code auto-instrumentation** — traces, metrics, and logs exported over
vendor-neutral OTLP with **no instrumentation code in the application at all**.

OpenTelemetry is loaded by a Node preload flag:

```bash
node --require @opentelemetry/auto-instrumentations-node/register dist/server.js
```

The register hook configures the SDK and all instrumentations (HTTP, Express,
winston) from the standard `OTEL_*` environment variables and flushes on shutdown —
so you can point it at any OTLP backend (Tempo, Datadog, Honeycomb, New Relic, …)
with **no code changes**, and the app source never imports OpenTelemetry.

Everything under [`observability/`](observability/) is a local stack used only to
_see_ the telemetry while you develop — supporting infrastructure, not part of what
you ship.

## What's inside

| Path                               | Role                                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| [`src/app.ts`](src/app.ts)         | Example Express app (`GET /hello`, `GET /health`) — **no OpenTelemetry imports**.   |
| [`src/server.ts`](src/server.ts)   | Starts the server with graceful shutdown — also no telemetry code.                  |
| [`package.json`](package.json)     | The `start` script applies the `--require` preload that turns instrumentation on.   |
| [`observability/`](observability/) | Supporting stack to test against: OTel Collector, Tempo, Loki, Prometheus, Grafana. |

> The example is organized by transport because it's a demo. As your service grows
> real domains, slice by domain instead — a folder per domain holding its routes,
> logic, and data access — rather than by technical layer.

## Quick start

```bash
npm install
npm run stack          # start collector + Tempo/Loki/Prometheus/Grafana
npm run build && npm start

# generate some telemetry
curl "http://localhost:8080/hello?name=World"
curl "http://localhost:8080/health"
```

`npm start` already includes the `--require` preload (plus `OTEL_SERVICE_NAME` and
stable HTTP semantic conventions). For faster local metric feedback, prefix with
`OTEL_METRIC_EXPORT_INTERVAL=5000`.

### See the telemetry

Open Grafana at <http://localhost:3000> (login `admin` / `admin`) → **Explore**:

- **Traces** — datasource `Tempo`, run TraceQL `{ resource.service.name = "greeter-service-nodejs" }`
- **Metrics** — datasource `Prometheus`, search for `http_server_request_duration_seconds_count`
- **Logs** — datasource `Loki`, query `{service_name="greeter-service-nodejs"}`

To watch what the collector receives:

```bash
docker compose -f observability/docker-compose.yaml logs -f otel-collector
```

## How OpenTelemetry is wired

There is **no telemetry code**. The `--require @opentelemetry/auto-instrumentations-node/register`
preload (in the `start` script) loads and starts the SDK before your application
modules, instruments HTTP/Express/winston, and exports all three signals via OTLP.
The app just uses Express and a winston logger:

```ts
// src/server.ts — note: no OpenTelemetry import
import { app, logger } from './app';
```

## Running under the OpenTelemetry Operator (Kubernetes)

This template enables auto-instrumentation manually via the `--require` preload. In
Kubernetes, the [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/)
injects the exact same mechanism for you — annotate the pod:

```yaml
metadata:
  annotations:
    instrumentation.opentelemetry.io/inject-nodejs: 'true'
```

The operator adds an init container carrying
`@opentelemetry/auto-instrumentations-node` and sets
`NODE_OPTIONS=--require @opentelemetry/auto-instrumentations-node/register` plus the
`OTEL_*` environment on your container. So under the operator you can drop the
`--require` from the start command and let it manage instrumentation. (For Node this
in-process require hook is the operator's instrumentation method — it does not use
eBPF.)

## Configuration

Configure through the standard `OTEL_*` environment variables:

| Environment variable           | Purpose                                                       | Default                                            |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`  | Collector / backend address                                   | `http://localhost:4318`                            |
| `OTEL_EXPORTER_OTLP_PROTOCOL`  | `http/protobuf` (this template) or `grpc`                     | `http/protobuf`                                    |
| `OTEL_EXPORTER_OTLP_HEADERS`   | Auth headers for hosted backends                              | _(none)_                                           |
| `OTEL_SERVICE_NAME`            | Service name                                                  | `greeter-service-nodejs` (set in the start script) |
| `OTEL_TRACES_SAMPLER` / `_ARG` | Sampling strategy / ratio                                     | `parentbased_always_on`                            |
| `OTEL_METRIC_EXPORT_INTERVAL`  | Metric export interval (ms)                                   | `60000`                                            |
| `OTEL_RESOURCE_ATTRIBUTES`     | Extra resource attributes, e.g. `deployment.environment=prod` | _(none)_                                           |

### Switching backends

```bash
# Point at any hosted OTLP/HTTP backend; pass its auth header(s)
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.example-backend.com
export OTEL_EXPORTER_OTLP_HEADERS=api-key=YOUR_KEY
```

## Scripts

```
npm run build        Compile TypeScript to dist/
npm start            Run with the auto-instrumentation preload
npm run dev          Run with watch (tsx) + preload
npm test             Run tests (vitest)
npm run typecheck    Type-check without emitting
npm run lint         ESLint
npm run format       Prettier (write)
npm run stack        Start the observability stack
npm run stack:down   Stop the observability stack
```

## License

MIT
