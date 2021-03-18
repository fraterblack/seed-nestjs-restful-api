import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { v4 } from 'uuid/interfaces';

import { TransformParams } from './dto-utils';

export abstract class BaseDto<T> {
    @Expose()
    @IsUUID()
    @IsOptional()
    @ApiPropertyOptional()
    id?: v4;

    @Expose({ toClassOnly: true })
    @ApiPropertyOptional({ description: 'True when record was soft deleted' })
    @Transform((params: TransformParams<T>) => {
        // tslint:disable-next-line: no-string-literal
        return (params && params.obj && params.obj['deletedAt']) ? true : undefined;
    })
    deleted?: boolean;

    @Expose()
    @IsDateString()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Last change in the record' })
    updatedAt?: Date;

    constructor(partial?: Partial<T>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
