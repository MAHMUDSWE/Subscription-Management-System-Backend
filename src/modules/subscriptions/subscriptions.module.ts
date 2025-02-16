import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SubscriptionRepository } from './repositories/subscription.repository';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    OrganizationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SubscriptionRepository],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule { }