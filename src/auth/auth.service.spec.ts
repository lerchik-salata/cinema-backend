import { AuthService } from "./auth.service";
import { UsersService } from "../users/user.service";
import { HashingService } from "./hashing/hashing.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserDocument } from "../users/schemas/user.schema";

const mockUser: Partial<UserDocument> = {
  id: "1",
  username: "test",
  passwordHash: "hashed_pwd",
};

type MockedUsersService = jest.Mocked<Pick<UsersService, "findOneByEmail">>;
type MockedHashingService = jest.Mocked<Pick<HashingService, "comparePasswords">>;
type MockedJwtService = jest.Mocked<Pick<JwtService, "signAsync">>;

describe("AuthService", () => {
  let service: AuthService;
  let mockUsersService: MockedUsersService;
  let mockHashingService: MockedHashingService;
  let mockJwtService: MockedJwtService;

  beforeEach(() => {
    mockUsersService = {
      findOneByEmail: jest.fn().mockResolvedValue(mockUser as UserDocument),
    };

    mockHashingService = {
      comparePasswords: jest.fn().mockResolvedValue(true),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue("mock_token"),
    };

    service = new AuthService(
      mockUsersService,
      mockJwtService,
      {} as ConfigService,
      mockHashingService,
    );
  });

  it("should return token on successful login", async () => {
    const result = await service.login("test@a.com", "password");

    expect(mockHashingService.comparePasswords).toHaveBeenCalledWith(
      "password",
      mockUser.passwordHash,
    );
    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser._id,
      username: mockUser.username,
    });
    expect(result.access_token).toEqual("mock_token");
  });
});
