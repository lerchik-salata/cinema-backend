import { Injectable } from "@nestjs/common";
import { CoreAuthService, CoreAuthResponse } from "cinema-auth";
import { CreateUserDto } from "./dto/create-user.dto";
import { plainToInstance } from "class-transformer";
import { UserResponseDto } from "../users/dto/user.dto";

@Injectable()
export class AuthService {
  constructor(private readonly coreAuthService: CoreAuthService) {}

  async register(createUserDto: CreateUserDto) {
    const result = await this.coreAuthService.register(
      { email: createUserDto.email, username: createUserDto.username },
      createUserDto.password,
    );

    return this.adaptResponse(result);
  }

  async login(email: string, pass: string) {
    const result = await this.coreAuthService.login(email, pass);

    return this.adaptResponse(result);
  }

  private adaptResponse(coreResponse: CoreAuthResponse) {
    const safeUser = plainToInstance(UserResponseDto, coreResponse.user, {
      excludeExtraneousValues: true,
    });

    return {
      access_token: coreResponse.accessToken,
      user: safeUser,
    };
  }
}
