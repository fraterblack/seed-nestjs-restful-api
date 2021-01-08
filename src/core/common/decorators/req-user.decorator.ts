import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { LoggedUser } from '../../authorization/models/logged-user-model';

export const ReqUser = createParamDecorator((data, ctx: ExecutionContext): LoggedUser => {
    const req = ctx.switchToHttp().getRequest();
    return req.user ? new LoggedUser(req.user) : null;
});
