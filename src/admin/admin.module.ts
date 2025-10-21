import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { AdminUsersController } from "./users/users.controller";
import { AdminUsersService } from "./users/users.service";

@Module({
  imports: [UsersModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminModule {}
