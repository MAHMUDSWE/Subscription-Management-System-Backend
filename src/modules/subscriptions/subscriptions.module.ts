import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscription } from '../../entities/subscription.entity';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription]),
    OrganizationsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}