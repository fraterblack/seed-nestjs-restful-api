import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '../configuration/config';

@Injectable()
export class AuthInternalStrategy extends PassportStrategy(Strategy, 'auth-internal') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: config.getAsBoolean('JWT_IGNORE_EXPIRATION'),
            secretOrKey: config.get('JWT_SECRET_KEY'),
        });
    }

    async validate(payload: any) {
        if (payload.id && payload.internal && payload.exp) {
            return payload;
        }
    }
}
