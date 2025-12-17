declare module "cinema-auth" {

  export interface CoreUser {
    _id: string;
    email: string;
    username: string;
    passwordHash: string;
    role: string;
  }

  export interface CoreCreateUserDto {
    email: string;
    username: string;
    password?: string;
  }

  export interface CoreAuthResponse {
    accessToken: string;
    user: {
      _id: string;
      email: string;
      username: string;
    };
  }

  export interface IUserRepository {
    findOneByEmail(email: string): Promise<CoreUser | null>;
    create(dto: CoreCreateUserDto, passwordHash: string): Promise<CoreUser>;
  }

  export class CoreAuthService {
    register(
      createUserDto: Partial<CoreCreateUserDto> & { password?: string },
      passwordPlain: string,
    ): Promise<CoreAuthResponse>;
    login(email: string, pass: string): Promise<CoreAuthResponse>;
  }

  export class CinemaAuthModule {
    static register(options: any): any;
    static registerAsync(options: any): any;
  }
}
