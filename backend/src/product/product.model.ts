import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  IsUrl
} from "class-validator";

export class ProductModel {

  @IsInt()
  @IsPositive()
  @IsOptional() // Because id is auto-generated (SERIAL)
  id?: number;

  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUrl()
  imageUrl?: string;

  @IsInt()
  categoryId?: number;

  @IsInt()
  @IsPositive()
  sellerId: number;

  @IsOptional()
  createdAt?: Date;
 status?: string; // Add this
  rejectionReason?: string;
  constructor(
    title: string,
    price: number,
    quantity: number,
    sellerId: number,
    description?: string,
    imageUrl?: string,
    categoryId?: number,
    id?: number,
    createdAt?: Date,status?:string,rejectionReason?:string
  ) {
    this.id = id!;
    this.title = title;
    this.description = description!;
    this.price = price;
    this.quantity = quantity;
    this.imageUrl = imageUrl!;
    this.categoryId = categoryId!;
    this.sellerId = sellerId;
    this.createdAt = createdAt!;
    this.status=status!;
    this.rejectionReason = rejectionReason!
  }
}
