import { IsString, IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail({}, { message: "The email field must contain a valid email address.." })
  email: string;

  @IsString({ message: "The username field must be a string." })
  @MinLength(3, { message: "The username must be at least 3 characters long." })
  username: string;

  @IsString({ message: "The password field must be a string." })
  @MinLength(6, { message: "The password must be at least 6 characters long." })
  password: string;
}
