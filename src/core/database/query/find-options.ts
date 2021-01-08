import { Transform } from 'class-transformer';

import { IInclude } from './interfaces/include.interface';

export class FindOptions {
    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    select?: string[];

    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    include?: string[] | IInclude;

    @Transform((data) => {
        return JSON.parse(decodeURIComponent(data));
    })
    sort?: object;

    @Transform(Boolean)
    includeDeleted?: boolean;
}
