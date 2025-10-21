import { Request } from "express";
import { UserRole } from "../users/user.service";

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
