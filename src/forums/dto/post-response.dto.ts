import { Exclude, Expose } from "class-transformer";
import { IsString, IsDateString, IsOptional } from "class-validator";

@Exclude()
export class PostResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  threadId: string;

  @Expose()
  @IsString()
  authorId: string;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsOptional()
  @IsString()
  parentPostId?: string;

  @Expose()
  @IsDateString()
  createdAt: string;

  @Expose()
  @IsOptional()
  @IsDateString()
  updatedAt?: string;
}
