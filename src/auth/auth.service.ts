import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "src/users/user.service";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseDto } from "src/users/dto/user.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    if (await this.usersService.findOneByEmail(createUserDto.email)) {
      throw new ConflictException("The user already exists");
    }

    const rawSaltRounds = this.configService.get<string>("BCRYPT_SALT_ROUNDS")!;
    const saltRounds = parseInt(rawSaltRounds, 10) || 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const newUser = await this.usersService.create(createUserDto, passwordHash);

    const payload = { sub: newUser._id, username: newUser.username };
    const safeUser = plainToInstance(UserResponseDto, newUser, { excludeExtraneousValues: true });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: safeUser,
    };
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.passwordHash);
    if (!isPasswordMatching) {
      throw new UnauthorizedException("Incorrect email or password");
    }

    const payload = { sub: user._id, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user._id, username: user.username },
    };
  }
}
