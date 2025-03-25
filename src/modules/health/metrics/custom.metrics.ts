import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class CustomMetrics {
    constructor(
        @InjectMetric('http_request_total')
        private readonly requestCounter: Counter<string>,
        @InjectMetric('active_users_total')
        private readonly activeUsersGauge: Gauge<string>,
        @InjectMetric('request_duration_seconds')
        private readonly requestDuration: Histogram<string>,
    ) { }

    incrementRequestCount(method: string, path: string, status: number) {
        this.requestCounter.inc({ method, path, status });
    }

    setActiveUsers(count: number) {
        this.activeUsersGauge.set(count);
    }

    observeRequestDuration(duration: number, method: string, path: string) {
        this.requestDuration.observe({ method, path }, duration);
    }
}