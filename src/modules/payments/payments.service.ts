import { Injectable, NotFoundException } from '@nestjs/common';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentRepository } from './repositories/payment.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly subscriptionsService: SubscriptionsService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const subscription = await this.subscriptionsService.findOne(createPaymentDto.subscriptionId);

    return this.paymentRepository.createPayment({
      subscription,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: PaymentStatus.PENDING,
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.findAllPayments();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findPaymentById(id);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async findBySubscription(subscriptionId: string): Promise<Payment[]> {
    return this.paymentRepository.findPaymentsBySubscription(subscriptionId);
  }
}