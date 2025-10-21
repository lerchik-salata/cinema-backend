import { IsString, IsEmail, IsDateString, IsNotEmpty, IsEnum } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { User, UserRole } from "../user.service";

@Exclude()
export class UserResponseDto {
  @Expose()
  @IsNotEmpty()
  id: string;

  @Expose()
  @IsEmail()
  email: string;

  @Expose()
  @IsString()
  username: string;

  @Expose()
  @IsEnum(UserRole, { message: "Not a valid role." })
  role: string;

  @Expose()
  @IsDateString()
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
