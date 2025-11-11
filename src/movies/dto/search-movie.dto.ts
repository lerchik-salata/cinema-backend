import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchMovieDto {
  @ApiProperty({
    description: "Search query string",
    example: "Dune",
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
