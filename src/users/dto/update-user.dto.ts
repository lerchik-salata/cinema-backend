import { IsString, IsEmail, IsOptional, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty({ example: "user@example.com" })
  @IsOptional()
  @IsEmail({}, { message: "Incorrect email format." })
  email?: string;

  @ApiProperty({ example: "username123" })
  @IsOptional()
  @IsString({ message: "Username must be a string." })
  @MinLength(3, { message: "Username must be at least 3 characters long." })
  username?: string;
}
