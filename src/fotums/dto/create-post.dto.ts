import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsNumber()
  parentPostId?: number;
}
