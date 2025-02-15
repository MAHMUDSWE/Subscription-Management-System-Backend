import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService {
    private logger: Logger;

    constructor(context: string = 'App') {
        this.logger = new Logger(context);
    }

    log(message: string) {
        this.logger.log(message);
    }

    error(message: string, trace?: string) {
        this.logger.error(message, trace);
    }
}
