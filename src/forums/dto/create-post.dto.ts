import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePostDto {
  @ApiProperty({ example: "This is a sample post content" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  parentPostId?: number;
}
