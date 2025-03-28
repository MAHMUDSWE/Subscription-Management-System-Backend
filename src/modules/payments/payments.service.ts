import { Injectable, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from 'src/entities/subscription.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentRepository } from './repositories/payment.repository';
import { PaymentProcessorService } from './services/payment-processor.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly paymentProcessorService: PaymentProcessorService,
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

  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    const payment = await this.create({
      subscriptionId: processPaymentDto.subscriptionId,
      amount: processPaymentDto.amount,
      method: processPaymentDto.method,
    });

    const gateway = this.paymentProcessorService.getPaymentGateway(processPaymentDto.method);
    const result = await gateway.processPayment(
      processPaymentDto.amount,
      processPaymentDto.currency,
      processPaymentDto.metadata,
    );

    if (result.success) {
      await this.updateStatus(payment.id, PaymentStatus.COMPLETED);
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = result.transactionId;
      payment.paymentDetails = result.metadata;
      await this.subscriptionsService.updateStatus(payment.subscription.id, SubscriptionStatus.ACTIVE);
    } else {
      await this.updateStatus(payment.id, PaymentStatus.FAILED);
      payment.status = PaymentStatus.FAILED;
    }

    return payment;
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

  async updateStatus(id: string, status: PaymentStatus): Promise<void> {
    await this.paymentRepository.updatePaymentStatus(id, status);
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.paymentRepository.findPaymentByTransactionId(transactionId);
  }

  async findByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.paymentRepository.findPaymentsByStatus(status);
  }
}