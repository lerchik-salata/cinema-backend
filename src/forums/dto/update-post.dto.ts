import { IsString, IsNotEmpty } from "class-validator";

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
