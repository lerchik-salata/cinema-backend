import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { AdminUsersController } from "./users/users.controller";
import { AdminUsersService } from "./users/users.service";
import { ForumsModule } from "../forums/forums.module";
import { AdminForumsController } from "./forums/forums.controller";
import { AdminForumsService } from "./forums/forums.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schemas/user.schema";

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
