import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpStatus } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { Server } from "http";
import { UsersService } from "../src/users/user.service";
import { HashingService } from "../src/auth/hashing/hashing.service";
import { UserRole } from "../src/users/enums/user-role.enum";

interface LoginResponse {
  access_token: string;
}

interface ForumThread {
  _id: string;
  title: string;
  content: string;
}

describe("Forum System (e2e)", () => {
  let app: INestApplication;
  let accessToken: string;
  let createdThreadId: string;
  let usersService: UsersService;
  let hashingService: HashingService;

  const testUser = {
    username: "john",
    email: "john@test.com",
    password: "changeme",
    role: UserRole.USER,
  };

  const testMovieId = "123";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    hashingService = moduleFixture.get<HashingService>(HashingService);

    const existingUser = await usersService.findOneByEmail(testUser.email);
    if (!existingUser) {
      const passwordHash = await hashingService.hashPassword(testUser.password);
      await usersService.create(
        { email: testUser.email, username: testUser.username, password: testUser.password },
        passwordHash,
      );
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("/auth/login (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/auth/login")
      .send({ email: "john@test.com", password: "changeme" })
      .expect(HttpStatus.OK);

    const body = response.body as LoginResponse;
    accessToken = body.access_token;
  });

  it("/forums/:id/posts (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post(`/forums/${testMovieId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Test", content: "Content" })
      .expect(HttpStatus.CREATED);

    const body = response.body as ForumThread;
    createdThreadId = body._id;
  });

  it("/forums/:id/posts (GET)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .get(`/forums/${testMovieId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);

    const body = response.body as ForumThread[];
    expect(body.length).toBeGreaterThan(0);
  });

  it("/forums/posts/:id (DELETE)", async () => {
    if (createdThreadId) {
      await request(app.getHttpServer() as Server)
        .delete(`/forums/posts/${createdThreadId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);
    }
  });
});
