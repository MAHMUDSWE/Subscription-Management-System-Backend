import { Logger, Module, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { v4 as uuid } from 'uuid';
import { getDatabaseConfig } from './config/database.config';
import { ActivityModule } from './modules/activity/activity.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';

const REQUEST_ID_HEADER = 'x-request-id';
const IS_PROD = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: IS_PROD ? 'info' : 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
          },
        },
        genReqId: (req) => {
          const requestIdHeader = req.headers[REQUEST_ID_HEADER];
          return requestIdHeader ? requestIdHeader.toString() : uuid();
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    UsersModule,
    AuthModule,
    OrganizationsModule,
    SubscriptionsModule,
    PaymentsModule,
    ActivityModule,
    HealthModule,
  ],
  controllers: [],
})
export class AppModule implements OnModuleDestroy, OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name);

  onModuleDestroy() {
    this.logger.log('⚠️ Module is being destroyed.');
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`🛑 Application is shutting down due to signal: ${signal}`);
  }
}
