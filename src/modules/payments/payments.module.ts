import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../../entities/payment.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './repositories/payment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    SubscriptionsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentRepository],
  exports: [PaymentsService],
})
export class PaymentsModule { }