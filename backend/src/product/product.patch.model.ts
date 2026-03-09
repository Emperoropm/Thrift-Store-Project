import { IsString, IsNumber, IsInt, Min, IsPositive, IsOptional, IsUrl } from "class-validator";

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

  @IsOptional()
  @IsInt()
  categoryId?: number;

  constructor(init?: Partial<ProductPatchModel>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
