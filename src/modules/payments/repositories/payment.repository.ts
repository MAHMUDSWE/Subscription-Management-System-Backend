import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Payment } from '../../../entities/payment.entity';

@Injectable()
export class PaymentRepository extends Repository<Payment> {
    constructor(private dataSource: DataSource) {
        super(Payment, dataSource.createEntityManager());
    }

    async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
        const payment = this.create(paymentData);
        return this.save(payment);
    }

    async findAllPayments(): Promise<Payment[]> {
        return this.find({
            relations: ['subscription', 'subscription.user', 'subscription.organization'],
        });
    }

    async findPaymentById(id: string): Promise<Payment | null> {
        return this.findOne({
            where: { id },
            relations: ['subscription', 'subscription.user', 'subscription.organization'],
        });
    }

    async findPaymentsBySubscription(subscriptionId: string): Promise<Payment[]> {
        return this.find({
            where: { subscription: { id: subscriptionId } },
        });
    }
}