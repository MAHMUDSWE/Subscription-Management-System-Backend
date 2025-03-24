import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/payment.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';
import { BkashService } from './services/bkash.service';
import { PaymentProcessorService } from './services/payment-processor.service';
import { StripeService } from './services/stripe.service';
import { StripeWebhookController } from './webhooks/stripe-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    forwardRef(() => SubscriptionsModule),
    NotificationsModule
  ],
  controllers: [PaymentsController, StripeWebhookController],
  providers: [
    PaymentsService,
    PaymentRepository,
    PaymentProcessorService,
    StripeService,
    BkashService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule { }