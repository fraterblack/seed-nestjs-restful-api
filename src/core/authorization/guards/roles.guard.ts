import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { concat, flattenDeep } from 'lodash';
import { ExtractJwt } from 'passport-jwt';

import { LoggedUser } from '../models/logged-user-model';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const handlerRoles: string[] = this.reflector.get<string[]>('roles', context.getHandler());
    const classRoles: string[] = this.reflector.get<string[]>('roles', context.getClass());
    let roles: string[] = [];

    if (handlerRoles) {
      roles = concat(roles, handlerRoles);
    }

    if (classRoles) {
      roles = concat(roles, classRoles);
    }

    roles = flattenDeep(roles);

    if (!roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    const user: LoggedUser = new LoggedUser(this.jwtService.decode(extractor(request)) as LoggedUser);

    if (!user || !user.roles) {
      return false;
    }

    // Super users has access to everything in the application
    if (user.isSuper()) {
      return true;
    }

    const hasRole = () => user.roles.some((role) => roles.includes(role));
    return hasRole();
  }
}
