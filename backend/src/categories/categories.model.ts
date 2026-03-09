import { IsInt, IsPositive, IsString, IsOptional, ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";
import { ProductModel } from "../product/product.model";

export class CategoryModel {
  @IsInt()
  @IsPositive()
  id: number;

  @IsString()
  name: string;

  @ValidateNested({ each: true })
  @Type(() => ProductModel)
  @IsOptional()
  products?: ProductModel[];

  constructor(id: number, name: string, products?: ProductModel[]) {
    this.id = id;
    this.name = name;
    this.products = products!;
  }
}
