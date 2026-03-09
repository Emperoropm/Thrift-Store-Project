import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { OrderItemStatus } from '@prisma/client';

export class UpdateOrderItemStatusDto {
  @IsEnum(OrderItemStatus, { 
    message: 'Status must be one of: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED' 
  })
  status: OrderItemStatus;
  
  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Reason must be at least 10 characters' })
  reason?: string;

  constructor(status: OrderItemStatus, reason: string | undefined = undefined) {
    this.status = status;
    this.reason = reason!;
  }
}