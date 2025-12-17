import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/user.service";
import { IUserRepository, CoreUser, CoreCreateUserDto } from "cinema-auth";

@Injectable()
export class UserRepositoryAdapter implements IUserRepository {
  constructor(private readonly usersService: UsersService) {}

  async findOneByEmail(email: string): Promise<CoreUser | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) return null;

    return {
      _id: user._id.toString(),
      email: user.email,
      username: user.username,
      passwordHash: (user as any).password,
      role: user.role,
    };
  }

  async create(dto: CoreCreateUserDto, passwordHash: string): Promise<CoreUser> {
    const newUser = await this.usersService.create(
      {
        email: dto.email,
        username: dto.username,
        password: passwordHash,
      } as any,
      passwordHash,
    );

    return {
      _id: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      passwordHash: (newUser as any).password,
      role: newUser.role,
    };
  }
}
