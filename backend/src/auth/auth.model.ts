import { Role } from "@prisma/client";
import { IsEmail, IsString, IsPositive, MinLength, IsEnum, IsNumber, IsOptional, IsDate } from "class-validator";

export class AuthModel {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsOptional()
  name?: string | null;

  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(4, { message: "Must be minimum 4 character" })
  password?: string;

  @IsOptional()
  @IsString()
  @IsEnum(["ADMIN", "USER"], { message: "Role should be admin or user" })
  role?: string;

  @IsOptional()
  @IsNumber()
  dailyProductCount?: number;

  @IsOptional()
  @IsDate()
  lastProductDate?: Date | null;

  // 👇 UPDATED: Remove URL validation, just validate it's a string
  @IsOptional()
  @IsString()
  photo?: string | null;

  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  constructor(name?: string, email?: string, password?: string, role?: string, photo?: string) {
    this.name = name!;
    this.email = email!;
    this.password = password!;
    this.role = role || "USER";
    this.photo = photo || null;
  }
}

export interface UserResponse {
  id: number;
  name: string | null;
  email: string;
  role: Role;
  photo: string | null; // Local file path
  dailyProductCount: number;
  lastProductDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}