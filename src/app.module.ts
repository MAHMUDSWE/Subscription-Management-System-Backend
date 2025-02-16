import { Logger, Module, OnApplicationShutdown, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UsersModule } from './modules/users/users.module';

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
    UsersModule,
    AuthModule,
    OrganizationsModule,
    SubscriptionsModule,
    PaymentsModule,
    HealthModule
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
