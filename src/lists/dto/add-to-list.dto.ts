import { IsString, IsNotEmpty, IsEnum } from "class-validator";

export enum ListType {
  WANT_TO_WATCH = "wantToWatch",
  WATCHED = "watched",
  FAVORITE = "favorite",
}

export class AddToListDto {
  @IsString()
  @IsNotEmpty()
  movieId: string;

  @IsEnum(ListType)
  @IsNotEmpty()
  listType: ListType;
}
