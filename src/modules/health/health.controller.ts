import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import * as fs from 'fs';
import * as os from 'os';

@ApiTags('health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) { }

    private checkDiskSpace(path: string) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                resolve(stats);
            });
        });
    }

    @Get()
    @HealthCheck()
    async check() {
        const isWindows = os.platform() === 'win32';
        const storagePath = isWindows ? 'C:\\' : '/';

        try {
            await this.checkDiskSpace(storagePath);
        } catch (err) {
            console.warn('Disk check failed:', (err as Error).message);
        }

        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
        ]);
    }
}