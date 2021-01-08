import { Transform } from 'class-transformer';

import { FindOptions } from './find-options';
import { IQueryFilter } from './interfaces/query-filter.interface';

export class QueryOptions extends FindOptions {
    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    where?: IQueryFilter[][];

    @Transform(Number)
    page?: number;

    @Transform(Number)
    limit?: number;
}
