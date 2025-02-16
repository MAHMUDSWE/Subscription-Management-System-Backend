import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../../../entities/payment.entity';

export class ProcessPaymentDto {
    @IsString()
    @IsNotEmpty()
    subscriptionId: string;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    method: PaymentMethod;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsOptional()
    metadata?: Record<string, any>;
}