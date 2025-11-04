import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";

@Injectable()
export class HashingService {
  constructor(private configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const rawSaltRounds = this.configService.get<string>("BCRYPT_SALT_ROUNDS")!;
    const saltRounds = parseInt(rawSaltRounds, 10) || 10;

    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
