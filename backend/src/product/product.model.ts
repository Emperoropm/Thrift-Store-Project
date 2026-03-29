import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsInt,
  Min,
  IsUrl,
  IsBoolean,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

export class LocationModel {
  @IsString()
  address!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;
}

export class ProductModel {

  @IsInt()
  @IsPositive()
  @IsOptional()
  id?: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  // NEW: Multiple images support
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  // NEW: Purchase date
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  // NEW: Gender
  @IsOptional()
  @IsString()
  gender?: string; // MEN, WOMEN, UNISEX, KIDS

  // NEW: Refundable
  @IsOptional()
  @IsBoolean()
  refundable?: boolean;

  // NEW: Location
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationModel)
  location?: LocationModel;

  @IsInt()
  categoryId?: number;

  @IsInt()
  @IsPositive()
  sellerId: number;

  @IsOptional()
  createdAt?: Date;
  
  status?: string;
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
    createdAt?: Date,
    status?: string,
    rejectionReason?: string,
    images?: string[],
    purchaseDate?: string,
    gender?: string,
    refundable?: boolean,
    location?: LocationModel
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
    this.status = status!;
    this.rejectionReason = rejectionReason!;
    this.images = images!;
    this.purchaseDate = purchaseDate!;
    this.gender = gender!;
    this.refundable = refundable!;
    this.location = location!;
  }
}