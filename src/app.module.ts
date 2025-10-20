import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config"; // Імпорт
import { CacheModule } from "@nestjs/cache-manager"; // Імпорт
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MoviesModule } from "./movies/movies.module"; // Імпорт нашого модуля

@Module({
  imports: [
    // Налаштування конфігурацій (глобально)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env", // шлях до .env
    }),
    // Налаштування кешу (глобально)
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // Час життя кешу в секундах (1 година)
    }),
    // Наші модулі
    AuthModule,
    UsersModule,
    MoviesModule, // Додаємо наш модуль
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
