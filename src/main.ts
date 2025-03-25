import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ApiVersionGuard } from './common/guards/api-version.guard';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { CustomMetrics } from './modules/health/metrics/custom.metrics';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');

  app.enableCors({
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'api-version'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Subscription Management System API')
    .setDescription('API documentation for the Subscription Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalGuards(new ApiVersionGuard(app.get(Reflector)));
  app.useGlobalInterceptors(new MetricsInterceptor(app.get(CustomMetrics)));

  app.enableShutdownHooks();

  await app.listen(3000, '0.0.0.0');
  logger.log('🚀 Application is running on: http://localhost:3000/api');
}
bootstrap();