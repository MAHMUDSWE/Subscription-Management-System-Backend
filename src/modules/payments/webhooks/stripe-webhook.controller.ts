import { Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { NotificationType } from '../../../entities/notification.entity';
import { PaymentStatus } from '../../../entities/payment.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { PaymentsService } from '../payments.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
    private readonly stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly paymentsService: PaymentsService,
        private readonly notificationsService: NotificationsService,
    ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2023-10-16',
        });
    }

    @Post()
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RawBodyRequest<any>,
    ) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                request.rawBody,
                signature,
                webhookSecret,
            );
        } catch (err) {
            throw new Error(`Webhook Error: ${(err as Error)?.message}`);
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(event.data.object);
                break;
        }

        return { received: true };
    }

    private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
        const payment = await this.paymentsService.findByTransactionId(paymentIntent.id);
        if (payment) {
            await this.paymentsService.updateStatus(payment.id, PaymentStatus.COMPLETED);
            await this.notificationsService.createNotification(
                payment.subscription.user,
                NotificationType.PAYMENT_SUCCESS,
                'Payment Successful',
                `Your payment of ${payment.amount} was successful.`,
                true,
            );
        }
    }

    private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
        const payment = await this.paymentsService.findByTransactionId(paymentIntent.id);
        if (payment) {
            await this.paymentsService.updateStatus(payment.id, PaymentStatus.FAILED);
            await this.notificationsService.createNotification(
                payment.subscription.user,
                NotificationType.PAYMENT_FAILED,
                'Payment Failed',
                `Your payment of ${payment.amount} failed. Please update your payment method.`,
                true,
            );
        }
    }
}