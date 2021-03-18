import { Transform } from 'class-transformer';

import { TransformParams } from '../../common/dtos/dto-utils';
import { GroupOption } from '../orm/orm-wrapper';
import { IInclude } from './interfaces/include.interface';
import { IQueryFilter } from './interfaces/query-filter.interface';

export class CountOptions {
    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    include?: string[] | IInclude;

    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    where?: IQueryFilter[][];

    @Transform((params: TransformParams) => Boolean(params.value))
    includeDeleted?: boolean;

    @Transform((params: TransformParams) => Boolean(params.value))
    distinct?: boolean;

    @Transform((params: TransformParams) => String(params.value))
    col?: string;

    group?: GroupOption;
}
