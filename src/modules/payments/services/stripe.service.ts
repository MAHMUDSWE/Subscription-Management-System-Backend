import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentGateway, PaymentResult } from '../interfaces/payment-gateway.interface';

@Injectable()
export class StripeService implements PaymentGateway {
    private stripe: Stripe;

    constructor(private configService: ConfigService) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }

    async processPayment(
        amount: number,
        currency: string,
        metadata: any,
    ): Promise<PaymentResult> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata,
            });

            return {
                success: true,
                transactionId: paymentIntent.id,
                metadata: paymentIntent,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || 'An error occurred while processing the payment',
            };
        }
    }

    async verifyPayment(paymentId: string): Promise<boolean> {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
            return paymentIntent.status === 'succeeded';
        } catch (error) {
            return false;
        }
    }

    async refundPayment(paymentId: string): Promise<boolean> {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentId,
            });
            return refund.status === 'succeeded';
        } catch (error) {
            return false;
        }
    }
}