import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../../entities/payment.entity';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { BkashService } from './bkash.service';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentProcessorService {
    private paymentGateways: Map<PaymentMethod, PaymentGateway>;

    constructor(
        private readonly stripeService: StripeService,
        private readonly bkashService: BkashService,
    ) {
        this.paymentGateways = new Map<PaymentMethod, PaymentGateway>([
            [PaymentMethod.STRIPE, stripeService],
            [PaymentMethod.BKASH, bkashService],
        ]);
    }

    getPaymentGateway(method: PaymentMethod): PaymentGateway {
        const gateway = this.paymentGateways.get(method);
        if (!gateway) {
            throw new Error(`Payment method ${method} not supported`);
        }
        return gateway;
    }
}