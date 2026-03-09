import { IsInt, IsPositive, IsNumber, IsOptional, ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";
import { OrderItemModel } from "./orderItem.model";

export class OrderModel {
  @IsInt()
  @IsPositive()
  buyerId: number;

  @IsNumber()
  @IsPositive()
  total: number;

  @ValidateNested({ each: true })
  @Type(() => OrderItemModel)
  @ArrayMinSize(1, { message: "Order must have at least one item" })
  items: OrderItemModel[];

  @IsOptional()
  createdAt?: Date;

  constructor(buyerId: number, total: number, items: OrderItemModel[], createdAt?: Date) {
    this.buyerId = buyerId;
    this.total = total;
    this.items = items;
    this.createdAt = createdAt!;
  }
}
