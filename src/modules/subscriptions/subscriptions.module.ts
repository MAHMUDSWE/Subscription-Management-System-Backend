import { forwardRef, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionRenewalService } from './services/subscription-renewal.service';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    OrganizationsModule,
    forwardRef(() => PaymentsModule),
    NotificationsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionRepository,
    SubscriptionRenewalService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule { }