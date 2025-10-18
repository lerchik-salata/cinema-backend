import { Module } from "@nestjs/common";
import { UsersService } from "./user.service";

@Module({
  imports: [],
  controllers: [],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
