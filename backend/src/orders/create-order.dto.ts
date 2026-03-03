import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string; // for food items
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;

  items: CreateOrderItemDto[];
}
