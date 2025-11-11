import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
  @ApiProperty({ example: "This is a sample new post content" })
  @IsString()
  @IsNotEmpty()
  content: string;
}
