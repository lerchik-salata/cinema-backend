import { Module } from "@nestjs/common";
import { UsersModule } from "src/users/users.module";
import { AdminUsersController } from "./users/users.controller";
import { AdminUsersService } from "./users/users.service";
import { ForumsModule } from "src/forums/forums.module";
import { AdminForumsController } from "./forums/forums.controller";
import { AdminForumsService } from "./forums/forums.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/users/schemas/user.schema";

@Module({
  imports: [
    UsersModule,
    ForumsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AdminUsersController, AdminForumsController],
  providers: [AdminUsersService, AdminForumsService],
})
export class AdminModule {}
