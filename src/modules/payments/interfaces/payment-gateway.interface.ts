export interface PaymentGateway {
    processPayment(amount: number, currency: string, metadata: any): Promise<PaymentResult>;
    verifyPayment(paymentId: string): Promise<boolean>;
    refundPayment(paymentId: string): Promise<boolean>;
}

export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    error?: string;
    metadata?: any;
}