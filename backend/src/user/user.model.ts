import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class UserModel {
  @IsOptional()
  id?: number;

  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  name: string;

  @IsEmail({}, { message: "Invalid email" })
  email: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password?: string;

  constructor(name: string, email: string, password?: string, id?: number) {
    this.id = id!;
    this.name = name;
    this.email = email;
    this.password = password!;
  }
}
