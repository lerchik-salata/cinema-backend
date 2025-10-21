import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { AdminUsersController } from "./users/users.controller";

@Module({
  imports: [UsersModule],
  controllers: [AdminUsersController],
  providers: [],
})
export class AdminModule {}
