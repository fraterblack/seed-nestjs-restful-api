import { Transform } from 'class-transformer';

import { TransformParams } from '../../common/dtos/dto-utils';
import { FindOptions } from './find-options';
import { IQueryFilter } from './interfaces/query-filter.interface';

export class QueryOptions extends FindOptions {
    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    where?: IQueryFilter[][];

    @Transform((params: TransformParams) => parseInt(params.value, 0))
    page?: number;

    @Transform((params: TransformParams) => parseInt(params.value, 0))
    limit?: number;
}
