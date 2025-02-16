import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentGateway, PaymentResult } from '../interfaces/payment-gateway.interface';

@Injectable()
export class BkashService implements PaymentGateway {
    private readonly baseUrl: string;
    private readonly username: string;
    private readonly password: string;
    private readonly appKey: string;
    private readonly appSecret: string;

    constructor(private configService: ConfigService) {
        this.baseUrl = this.configService.get('BKASH_BASE_URL');
        this.username = this.configService.get('BKASH_USERNAME');
        this.password = this.configService.get('BKASH_PASSWORD');
        this.appKey = this.configService.get('BKASH_APP_KEY');
        this.appSecret = this.configService.get('BKASH_APP_SECRET');
    }

    private async getToken(): Promise<string> {
        try {
            const response = await axios.post(`${this.baseUrl}/token/grant`, {
                app_key: this.appKey,
                app_secret: this.appSecret,
            }, {
                headers: {
                    username: this.username,
                    password: this.password,
                },
            });

            return response.data.id_token;
        } catch (error: any) {
            throw new Error(error?.message || 'Failed to get bKash token');
        }
    }

    async processPayment(
        amount: number,
        currency: string,
        metadata: any,
    ): Promise<PaymentResult> {
        try {
            const token = await this.getToken();
            const response = await axios.post(
                `${this.baseUrl}/checkout/payment/create`,
                {
                    amount,
                    currency,
                    merchantInvoiceNumber: metadata.invoiceNumber,
                    intent: 'sale',
                },
                {
                    headers: {
                        Authorization: token,
                        'X-APP-Key': this.appKey,
                    },
                },
            );

            return {
                success: true,
                transactionId: response.data.paymentID,
                metadata: response.data,
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
            const token = await this.getToken();
            const response = await axios.get(
                `${this.baseUrl}/checkout/payment/query/${paymentId}`,
                {
                    headers: {
                        Authorization: token,
                        'X-APP-Key': this.appKey,
                    },
                },
            );

            return response.data.transactionStatus === 'Completed';
        } catch (error) {
            return false;
        }
    }

    async refundPayment(paymentId: string): Promise<boolean> {
        try {
            const token = await this.getToken();
            const response = await axios.post(
                `${this.baseUrl}/checkout/payment/refund`,
                {
                    paymentID: paymentId,
                },
                {
                    headers: {
                        Authorization: token,
                        'X-APP-Key': this.appKey,
                    },
                },
            );

            return response.data.statusCode === '0000';
        } catch (error) {
            return false;
        }
    }
}