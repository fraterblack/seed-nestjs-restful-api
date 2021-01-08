import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DatabaseError, ValidationError } from 'sequelize';

import { EntityNotFoundError } from './../../database/orm/exceptions/entity-not-found.error';

@Catch()
export class ErrorFilter implements ExceptionFilter {
    catch(exception: Error, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        let httpStatus: HttpStatus;

        // Get exception status
        if (exception instanceof EntityNotFoundError) {
            httpStatus = HttpStatus.NOT_FOUND;
        } else if (exception instanceof ValidationError || exception instanceof DatabaseError) {
            httpStatus = HttpStatus.BAD_REQUEST;
        } else if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
        } else {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        // Do not log Unauthozed error
        if (httpStatus !== HttpStatus.UNAUTHORIZED) {
            const logger = new Logger(`Error ${httpStatus}`);
            logger.error(exception);
        }

        // tslint:disable-next-line: no-string-literal
        if (!exception.message['statusCode']) {
            const error = {
                statusCode: httpStatus,
                error: exception.message,
            };

            if (exception instanceof HttpException) {
                const exceptionResponse = exception.getResponse();
                // tslint:disable-next-line: no-string-literal
                error['message'] = exceptionResponse['message'];
                // tslint:disable-next-line: no-string-literal
                error['error'] = exceptionResponse['error'];
            }

            if (exception instanceof ValidationError) {
                error.error = `DatabaseValidationError: ${error.error}`;
                // tslint:disable-next-line: no-string-literal
                error['message'] = exception.errors;
            }

            if (exception instanceof DatabaseError) {
                error.error = `DatabaseError: ${error.error}`;
                // tslint:disable-next-line: no-string-literal
                error['message'] = exception.parent['detail'];
            }

            response.status(httpStatus).send(error);
        } else {
            response.status(httpStatus).send(exception.message);
        }
    }
}
