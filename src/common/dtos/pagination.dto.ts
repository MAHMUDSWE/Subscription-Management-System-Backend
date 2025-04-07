import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaginationDto {
    @ApiProperty({ required: false, minimum: 1, default: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, minimum: 1, default: 10 })
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number = 10;
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
        perPage: number;
    };
}