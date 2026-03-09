import { IsString, MinLength } from 'class-validator';

export class CancelOrderItemDto {
  @IsString()
  @MinLength(10, { message: 'Cancellation reason must be at least 10 characters' })
  reason: string;

  constructor(reason: string) {
    this.reason = reason;
  }
}