import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { UsersService } from "./users/user.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Cinema API")
    .setDescription("API documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  app.enableCors({
    origin: "http://localhost:3001",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  if (process.env.AUTO_CREATE_ADMIN === "true") {
    const usersService = app.get(UsersService);
    await usersService.findOrCreateAdmin("admin@lab3.com", "adminpassword");
  }

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => console.error("Bootstrap error:", err));
