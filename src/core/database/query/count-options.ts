import { Transform } from 'class-transformer';

import { GroupOption } from '../orm/orm-wrapper';
import { IInclude } from './interfaces/include.interface';
import { IQueryFilter } from './interfaces/query-filter.interface';

export class CountOptions {
    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    include?: string[] | IInclude;

    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    where?: IQueryFilter[][];

    @Transform(Boolean)
    includeDeleted?: boolean;

    @Transform(Boolean)
    distinct?: boolean;

    @Transform(String)
    col?: string;

    // @Transform(String)
    group?: GroupOption;
}
