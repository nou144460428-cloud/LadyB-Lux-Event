// register.dto.ts
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Role, AccountType } from '@prisma/client';

export class RegisterDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @MinLength(6) password: string;
  @IsEnum(Role) role: Role;
  @IsOptional() @IsEnum(AccountType) accountType?: AccountType;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() nextOfKinName?: string;
  @IsOptional() @IsString() nextOfKinPhone?: string;
  @IsOptional() @IsString() nextOfKinRelationship?: string;
}
