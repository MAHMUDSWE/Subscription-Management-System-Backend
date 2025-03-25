import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomMetrics } from '../../modules/health/metrics/custom.metrics';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
    constructor(private readonly metrics: CustomMetrics) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const start = Date.now();
        const http = context.switchToHttp();
        const request = http.getRequest();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                this.metrics.incrementRequestCount(
                    request.method,
                    request.route.path,
                    request.res.statusCode,
                );
                this.metrics.observeRequestDuration(
                    duration / 1000,
                    request.method,
                    request.route.path,
                );
            }),
        );
    }
}