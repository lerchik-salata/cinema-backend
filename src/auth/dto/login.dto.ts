import { IsString, IsEmail, MinLength } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "Incorrect email format." })
  email: string;

  @IsString({ message: "The password field must be a string." })
  @MinLength(6, { message: "The password must be at least 6 characters long." })
  password: string;
}
