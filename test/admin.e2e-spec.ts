import request, { Response } from "supertest";
import { INestApplication, ValidationPipe, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { UsersService } from "../src/users/user.service";

interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}
interface PostResponse {
  id?: string;
  _id: string;
  content: string;
}

const unique = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

describe("AdminModule (E2E API)", () => {
  let app: INestApplication;
  let server: request.SuperTest<request.Test>;
  let usersService: UsersService;

  let adminToken: string;
  let userToken: string;
  let userId: string;

  let createdPostId: string;

  const testMovieId = "123";
  const adminTestEmail = "admin@lab3.com";
  const adminTestPassword = "adminpassword";
  const userPassword = "TestUser123!";

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
    // @ts-ignore
    server = request(app.getHttpServer());

    usersService = moduleFixture.get<UsersService>(UsersService);

    const userEmail = `user_${unique()}@test.com`;

    const userRes: Response = await server
      .post("/auth/register")
      .send({
        email: userEmail,
        username: `user_${unique()}`,
        password: userPassword,
      })
      .expect(HttpStatus.CREATED);

    const userBody = userRes.body as AuthResponse;
    userId = userBody.user.id;
    userToken = userBody.access_token;

    const adminUserToUpdate = await usersService.findOneByEmail(adminTestEmail);
    if (!adminUserToUpdate) {
      await usersService.findOrCreateAdmin(adminTestEmail, adminTestPassword);
    }

    const loginAdminRes: Response = await server
      .post("/auth/login")
      .send({
        email: adminTestEmail,
        password: adminTestPassword,
      })
      .expect(HttpStatus.OK);

    const loginAdminBody = loginAdminRes.body as AuthResponse;
    adminToken = loginAdminBody.access_token;

    const postRes: Response = await server
      .post(`/forums/${testMovieId}/posts`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        content: "Some text...",
      })
      .expect(HttpStatus.CREATED);

    const postBody = postRes.body as PostResponse;
    createdPostId = postBody.id || postBody._id;
  });

  describe("AdminUsersController", () => {
    it("should block non-admin user for GET /admin/users (403)", () => {
      return server
        .get("/admin/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it("should allow admin to GET all users", () => {
      return server
        .get("/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it("should allow admin to GET specific user", () => {
      return server
        .get(`/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const body = res.body as AuthResponse["user"];
          expect(body.id).toBe(userId);
        });
    });

    it("should allow admin to DELETE user", async () => {
      await server
        .delete(`/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });
  });

  describe("AdminForumsController", () => {
    it("should allow admin to GET all posts", () => {
      return server
        .get("/admin/forums/posts")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it("should allow admin to PATCH post", () => {
      const updatedContent = "Updated content by admin";

      return server
        .patch(`/admin/forums/posts/${createdPostId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          content: updatedContent,
        })
        .expect(HttpStatus.OK)
        .expect((res) => {
          const body = res.body as PostResponse;
          expect(body.content).toBe(updatedContent);
        });
    });

    it("should allow admin to DELETE post", async () => {
      await server
        .delete(`/admin/forums/posts/${createdPostId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      await server
        .get(`/forums/posts/${createdPostId}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
