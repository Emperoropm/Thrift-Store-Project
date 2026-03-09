import { 
  IsInt, 
  IsPositive, 
  IsNumber, 
  ValidateNested, 
  ArrayMinSize,
  IsArray 
} from "class-validator";
import { Type } from "class-transformer";

export class CreateOrderItemDto {
  @IsInt()
  @IsPositive()
  productId!: number;

  @IsInt()
  @IsPositive()
  quantity!: number;

  // Note: Price is not needed here, it will be fetched from the database
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1, { message: "Order must have at least one item" })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  products!: CreateOrderItemDto[];
}