import { IsString, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: "Incorrect email format." })
  email: string;

  @ApiProperty({ example: "strongPassword123" })
  @IsString({ message: "The password field must be a string." })
  @MinLength(6, { message: "The password must be at least 6 characters long." })
  password: string;
}
