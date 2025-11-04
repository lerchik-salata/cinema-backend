import { IsString, IsEmail, IsDateString, IsNotEmpty, IsEnum } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { UserRole } from "../enums/user-role.enum";

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

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
