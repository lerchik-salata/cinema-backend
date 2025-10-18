import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "../auth/dto/create-user.dto";

export interface User {
  _id: string;
  email: string;
  username: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private nextId = 1;

  constructor() {}

  async onModuleInit() {
    await this.createDummyUser("test@lab3.com", "TestUser", "password123");
  }

  private async createDummyUser(email: string, username: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    this.users.push({ _id: (this.nextId++).toString(), email, username, passwordHash });
    console.log(`[UsersService] Test user created: ${username}`);
  }

  async create(dto: CreateUserDto, passwordHash: string): Promise<User> {
    await Promise.resolve();
    const newUser: User = {
      _id: (this.nextId++).toString(),
      email: dto.email,
      username: dto.username,
      passwordHash: passwordHash,
    };
    this.users.push(newUser);
    return newUser;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    await Promise.resolve();
    return this.users.find((user) => user.email === email);
  }

  async findOneById(id: string): Promise<User | undefined> {
    await Promise.resolve();
    return this.users.find((user) => user._id === id);
  }
}
