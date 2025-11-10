import { Module, forwardRef } from "@nestjs/common";
import { UsersService } from "./user.service";
import { UsersController } from "./users.controller";
import { AuthModule } from "src/auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
