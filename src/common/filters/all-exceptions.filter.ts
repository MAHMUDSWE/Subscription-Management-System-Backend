import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {

    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            return response.status(exception.getStatus()).json(exception.getResponse());
        }

        if (exception instanceof QueryFailedError) {

            this.logger.error(exception.toString());

            return response.status(400).json({
                statusCode: 400,
                message: 'Database query failed. Check input values.',
            });
        }

        this.logger.error(exception.toString());

        return response.status(500).json({
            statusCode: 500,
            message: 'Internal Server Error',
        });
    }
}
