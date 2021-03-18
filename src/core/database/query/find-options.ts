import { Transform } from 'class-transformer';

import { TransformParams } from '../../common/dtos/dto-utils';
import { IInclude } from './interfaces/include.interface';

export class FindOptions {
    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    select?: string[];

    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    include?: string[] | IInclude;

    @Transform((params: TransformParams) => {
        return JSON.parse(decodeURIComponent(params.value));
    })
    sort?: object;

    @Transform((params: TransformParams) => Boolean(params.value))
    includeDeleted?: boolean;
}
