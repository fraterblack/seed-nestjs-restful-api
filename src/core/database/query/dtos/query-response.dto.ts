import { ApiProperty } from '@nestjs/swagger';

import { IQueryResponse } from '../interfaces/query-response.interface';

export class QueryResponseDto<T> {
    @ApiProperty({ type: [Object], description: 'A list of T items. QueryResponseDto<<T>T>' }) // <<T>T> workaound to render <T>
    public results: T[];

    @ApiProperty()
    public page: number;

    @ApiProperty()
    public limit: number;

    @ApiProperty()
    public pages: number;

    @ApiProperty()
    public total: number;

    constructor(paginationResults: IQueryResponse<T>) {
        const { results, page, limit, total } = paginationResults;

        this.results = results;
        this.page = Number(page);
        this.limit = Number(limit);
        this.pages = limit ? Math.ceil(total / limit) : 1;
        this.total = total;
    }
}
