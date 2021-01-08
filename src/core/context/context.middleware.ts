import { Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt } from 'passport-jwt';

import { LoggedUser } from '../authorization/models/logged-user-model';
import { Context } from './context';
import { ContextData } from './context-data';

/**
 * Middleware to set context data from request to be used throughout the application
 */
@Injectable()
export class ContextMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) { }

    use(req: any, res: any, next: () => void): any {
        const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
        const user = this.jwtService.decode(extractor(req)) as LoggedUser;

        // On close request
        res.on('finish', () => {
            Context.setData(null);
        });

        // Set token, user and license ids to context
        const context = user ? new ContextData({
            authorization: `Bearer ${extractor(req)}`,
            userId: user.id,
            licenseId: user.licenseId,
        }) : new ContextData();

        Context.setData(context);

        next();
    }
}
