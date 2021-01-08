import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { IQueryFilter } from './../interfaces/query-filter.interface';
import { FindOptionsDto } from './find-options.dto';

export class QueryOptionsDto extends FindOptionsDto {
    @ApiProperty({ required: false, description: 'Usage: where=[[{"col":"id","op":"=","value":"UUID"},{"col":"name","op":"=","value":"Angra dos Reis"}],[{"col":"another","op":"=","value":"UUID"}]]' })
    @IsOptional()
    @IsString()
    where?: string;

    @ApiProperty({ required: false, description: 'Usage: page=1' })
    @IsOptional()
    @IsString()
    page?: number;

    @ApiProperty({ required: false, description: 'Usage: limit=10' })
    @IsOptional()
    @IsString()
    limit?: number;

    setWhere(where: IQueryFilter[][]): QueryOptionsDto {
        this.where = this.setWhereValue(where, this.where);

        return this;
    }

    setPage(page: number): QueryOptionsDto {
        this.page = page;

        return this;
    }

    setLimit(limit: number): QueryOptionsDto {
        this.limit = limit;

        return this;
    }

    protected setWhereValue(value: IQueryFilter[][], currentValue?: string): string {
        if (currentValue) {
            let parsedCurrentValue = JSON.parse(currentValue);

            parsedCurrentValue = [...parsedCurrentValue, ...value];

            return JSON.stringify(parsedCurrentValue);
        } else {
            return JSON.stringify(value);
        }
    }
}
