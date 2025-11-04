import { Request } from "express";
import { UserRole } from "../users/enums/user-role.enum";

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
