import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule, makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics.controller';
import { CustomMetrics } from './metrics/custom.metrics';

@Module({
    imports: [TerminusModule, PrometheusModule.register()],
    controllers: [HealthController, MetricsController],
    providers: [
        makeCounterProvider({
            name: 'http_request_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'path', 'status'],
        }),
        makeGaugeProvider({
            name: 'active_users_total',
            help: 'Total number of active users',
        }),
        makeHistogramProvider({
            name: 'request_duration_seconds',
            help: 'Request duration in seconds',
            labelNames: ['method', 'path'],
            buckets: [0.1, 0.5, 1, 2, 5],
        }),
        CustomMetrics,
    ],
    exports: [CustomMetrics],
})
export class HealthModule { }
