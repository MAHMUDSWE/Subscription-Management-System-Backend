import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getPaginatedResponse, getPaginationParams } from 'src/common/utils/pagination.util';
import { PaginatedResponse, PaginationDto } from '../../common/dtos/pagination.dto';
import { NotificationType } from '../../entities/notification.entity';
import { Payment, PaymentStatus } from '../../entities/payment.entity';
import { SubscriptionStatus } from '../../entities/subscription.entity';
import { NotificationsService } from '../notifications/notifications.service';
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
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const subscription = await this.subscriptionsService.findOne(createPaymentDto.subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.paymentRepository.createPayment({
      subscription,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      status: PaymentStatus.PENDING,
    });
  }

  async processPayment(processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    try {
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

        await this.notificationsService.createNotification(
          payment.subscription.user,
          NotificationType.PAYMENT_SUCCESS,
          'Payment Successful',
          `Your payment of ${payment.amount} was successful.`,
          true
        );
      } else {
        await this.updateStatus(payment.id, PaymentStatus.FAILED);
        payment.status = PaymentStatus.FAILED;

        await this.notificationsService.createNotification(
          payment.subscription.user,
          NotificationType.PAYMENT_FAILED,
          'Payment Failed',
          `Your payment of ${payment.amount} failed. Please try again.`,
          true
        );

        throw new BadRequestException(result.error || 'Payment processing failed');
      }

      return payment;
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Payment processing failed');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Payment>> {
    const { skip, take } = getPaginationParams(paginationDto.page, paginationDto.limit);

    const [items, total] = await this.paymentRepository.findPaginatedPayments(skip, take);

    return getPaginatedResponse(items, total, paginationDto.page, paginationDto.limit);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async findBySubscription(subscriptionId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Payment>> {

    const { skip, take } = getPaginationParams(paginationDto.page, paginationDto.limit);

    const [items, total] = await this.paymentRepository.findPaymentsBySubscription(subscriptionId, skip, take);
    return getPaginatedResponse(items, total, paginationDto.page, paginationDto.limit);
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