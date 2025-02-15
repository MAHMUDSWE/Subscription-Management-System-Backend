import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OrganizationType } from '../../../entities/organization.entity';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(OrganizationType)
  @IsNotEmpty()
  type: OrganizationType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyFee: number;
}