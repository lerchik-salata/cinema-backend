import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum } from "class-validator";

export enum ListType {
  WANT_TO_WATCH = "wantToWatch",
  WATCHED = "watched",
  FAVORITE = "favorite",
}

export class AddToListDto {
  @ApiProperty({ description: "123456" })
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @ApiProperty({
    enum: ListType,
    enumName: "ListType",
    description: "Type of the list (wantToWatch, watched, favorite)",
    example: ListType.WANT_TO_WATCH,
  })
  @IsEnum(ListType)
  @IsNotEmpty()
  listType: ListType;
}
