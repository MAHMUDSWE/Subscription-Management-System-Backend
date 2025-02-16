import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import pinoHttp from 'pino-http';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Setup Pino Logger
  const pinoLogger = pinoHttp({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
      },
    },
  });

  app.use(pinoLogger);

  // Enable CORS with explicit configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global Validation Pipe with strict validation options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Subscription Management System API')
    .setDescription('API documentation for the Subscription Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  await app.listen(3000, '0.0.0.0');
  logger.log('🚀 Application is running on: http://localhost:3000/api');
}
bootstrap();
