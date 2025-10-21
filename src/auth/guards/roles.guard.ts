import { CanActivate, ExecutionContext, Injectable, mixin, Type } from "@nestjs/common";
import { UserRole } from "src/users/user.service";
import { Observable } from "rxjs";
import type { AuthenticatedRequest } from "src/auth/auth.interface";

export function RolesGuard(role: UserRole): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request: AuthenticatedRequest = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || user.role !== role) {
        return false;
      }
      return true;
    }
  }
  return mixin(RoleGuardMixin);
}
