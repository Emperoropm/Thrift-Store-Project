import { 
  IsString, 
  IsNumber, 
  IsInt, 
  Min, 
  IsPositive, 
  IsOptional, 
  IsUrl,
  IsBoolean,
  IsDateString,
  IsObject,
  IsArray,
  ValidateNested
} from "class-validator";
import { Type } from "class-transformer";

class LocationPatchModel {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}

export class ProductPatchModel {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  // NEW: Multiple images support
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  // NEW: Images to delete
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesToDelete?: string[];

  // NEW: New images to add (base64 or URLs)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newImages?: string[];

  // NEW: Purchase date
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  // NEW: Gender
  @IsOptional()
  @IsString()
  gender?: string;

  // NEW: Refundable
  @IsOptional()
  @IsBoolean()
  refundable?: boolean;

  // NEW: Location
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LocationPatchModel)
  location?: LocationPatchModel;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  constructor(init?: Partial<ProductPatchModel>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}