import { Module, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserRepositoryAdapter } from "./user.repository.adapter";
import { CinemaAuthModule } from "cinema-auth";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    CinemaAuthModule.registerAsync({
      imports: [],
      useFactory: (configService: ConfigService) => ({
        jwtSecret: configService.get<string>("JWT_SECRET") || "secretKey",
        jwtExpiresIn: "60m",
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    UserRepositoryAdapter,
    {
      provide: "IUserRepository",
      useClass: UserRepositoryAdapter,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

// - Анекдот для Вас
// — Тату, а чому сонце сходить на сході, а заходить на заході?
// — Синку, воно працює?
// — Так.
// — От і не чіпай!
