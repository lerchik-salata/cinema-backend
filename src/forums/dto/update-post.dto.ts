import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
  @ApiProperty({ example: "This is the updated content of the post." })
  @IsString()
  @IsNotEmpty({ message: "The post content must not be empty." })
  content: string;
}
