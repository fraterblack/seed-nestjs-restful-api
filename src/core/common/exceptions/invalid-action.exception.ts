import { BadRequestException } from '@nestjs/common';

import { ErrorObject } from './error-object.interface';

export class InvalidActionException extends BadRequestException {
    constructor(description?: any, objectError: ErrorObject = {}) {
        super(description, JSON.stringify(objectError));
    }
}
