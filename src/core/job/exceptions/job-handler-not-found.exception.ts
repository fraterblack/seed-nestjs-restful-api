import { InternalServerErrorException } from '@nestjs/common';

export class JobHandlerNotFoundException extends InternalServerErrorException {
    constructor(description?: any, objectError = {}) {
        super(description, JSON.stringify(objectError));
    }
}
