import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class FilterMoviesDto {
  @ApiProperty({ required: false, description: "Filter by genre ID" })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiProperty({ required: false, description: "Filter by release year" })
  @IsOptional()
  @IsString()
  year?: string;
}
