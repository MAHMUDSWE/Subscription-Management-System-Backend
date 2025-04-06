import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CancelSubscriptionDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    reason?: string;

    @ApiProperty({ required: false, default: false })
    @IsOptional()
    @IsBoolean()
    immediate?: boolean = false;
}