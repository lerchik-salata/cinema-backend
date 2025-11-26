import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";
import { Server } from "http";

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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/auth/login (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/auth/login")
      .send({ username: "john", password: "changeme" })
      .expect(201);

    const body = response.body as LoginResponse;
    accessToken = body.access_token;
  });

  it("/forums (POST)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .post("/forums")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Test", content: "Content" })
      .expect(201);

    const body = response.body as ForumThread;
    createdThreadId = body._id;
  });

  it("/forums (GET)", async () => {
    const response = await request(app.getHttpServer() as Server)
      .get("/forums")
      .expect(200);

    const body = response.body as ForumThread[];
    expect(body.length).toBeGreaterThan(0);
  });

  it("/forums/:id (DELETE)", async () => {
    if (createdThreadId) {
      await request(app.getHttpServer() as Server)
        .delete(`/forums/${createdThreadId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
    }
  });
});
