import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Payment, PaymentStatus } from '../../../entities/payment.entity';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
    constructor(dataSource: DataSource) {
        super(Payment, dataSource.createEntityManager());
    }

    async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
        const payment = this.create(paymentData);
        return this.save(payment);
    }

    async findPaginatedPayments(skip: number, take: number): Promise<[Payment[], number]> {
        return this.findAndCount({
            skip,
            take,
            order: { createdAt: 'DESC' },
            relations: ['subscription', 'subscription.user', 'subscription.organization'],
        });
    }

    async findPaymentById(id: string): Promise<Payment | null> {
        return this.findOne({
            where: { id },
            relations: ['subscription', 'subscription.user', 'subscription.organization'],
        });
    }

    async findPaymentsBySubscription(subscriptionId: string, skip: number, take: number): Promise<[Payment[], number]> {
        return this.findAndCount({
            where: { subscription: { id: subscriptionId } },
            skip,
            take,
            order: { createdAt: 'DESC' },
            relations: ['subscription', 'subscription.user', 'subscription.organization'],
        });
    }

    async updatePaymentStatus(id: string, status: PaymentStatus): Promise<void> {
        await this.update(id, { status });
    }

    async findPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
        return this.findOne({ where: { transactionId } });
    }

    async findPendingPayments(): Promise<Payment[]> {
        return this.find({ where: { status: PaymentStatus.PENDING } });
    }

    async findFailedPayments(): Promise<Payment[]> {
        return this.find({ where: { status: PaymentStatus.FAILED } });
    }

    async findCompletedPayments(): Promise<Payment[]> {
        return this.find({ where: { status: PaymentStatus.COMPLETED } });
    }

    async findPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
        return this.find({ where: { status } });
    }
}