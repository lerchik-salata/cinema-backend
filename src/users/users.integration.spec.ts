import request, { Response } from "supertest";
import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface ProfileResponse {
  id: string;
  email: string;
  username: string;
  role: string;
}

const unique = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

describe("UsersController (E2E API)", () => {
  let app: INestApplication;
  let server: request.SuperTest<request.Test>;

  const password = "UserPassword123!";
  let email: string;
  let username: string;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    server = request(app.getHttpServer());

    email = `user-e2e-${unique()}@test.com`;
    username = `e2eUser_${unique()}`;

    const registerRes: Response = await server
      .post("/auth/register")
      .send({
        email,
        username,
        password,
      })
      .expect(HttpStatus.CREATED);

    const { access_token, user } = registerRes.body as AuthResponse;

    token = access_token;
    userId = user.id;
  });

  describe("GET /users/me", () => {
    it("should return 401 if no token provided", () => {
      return server.get("/users/me").expect(HttpStatus.UNAUTHORIZED);
    });

    it("should return current user profile when token is valid", () => {
      return server
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const body = res.body as ProfileResponse;
          expect(body.id).toBe(userId);
          expect(body.email).toBe(email);
          expect(res.body).not.toHaveProperty("passwordHash");
        });
    });
  });

  describe("PATCH /users/me", () => {
    const newName = "UpdatedE2EUser";

    it("should update user data", () => {
      return server
        .patch("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ username: newName })
        .expect(HttpStatus.OK)
        .expect((res) => {
          const body = res.body as ProfileResponse;
          expect(body.username).toBe(newName);
          expect(body.id).toBe(userId);
        });
    });

    it("should return 400 if invalid email format", () => {
      return server
        .patch("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({ email: "invalid-email" })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe("PUT /users/me/password", () => {
    const newPassword = "ChangedPassword456!";

    it("should update password and allow login with new one", async () => {
      await server
        .put("/users/me/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ newPassword })
        .expect(HttpStatus.OK);

      const loginRes: Response = await server
        .post("/auth/login")
        .send({ email, password: newPassword })
        .expect(HttpStatus.OK);

      const loginBody = loginRes.body as AuthResponse;
      expect(loginBody.access_token).toBeDefined();

      await server.post("/auth/login").send({ email, password }).expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe("DELETE /users/me", () => {
    it("should delete user and deny access afterwards", async () => {
      await server
        .delete("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.OK);

      await server
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
