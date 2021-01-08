import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { IInclude } from './../interfaces/include.interface';

export class FindOptionsDto {
    @ApiProperty({ required: false, description: 'Usage: select=["name","id"]' })
    @IsOptional()
    @IsString()
    select?: string;

    @ApiProperty({ required: false, description: 'Usage: include=["state"]' })
    @IsOptional()
    @IsString()
    include?: string;

    @ApiProperty({ required: false, description: 'Usage: expand=["address"]' })
    @IsOptional()
    @IsString()
    expand?: string;

    @ApiProperty({ required: false, description: 'Usage: sort={"name":"ASC","id":"DESC"}' })
    @IsOptional()
    @IsString()
    sort?: string;

    @ApiProperty({ required: false, description: 'Usage: includeDeleted=true' })
    @IsOptional()
    @IsString()
    includeDeleted?: boolean;

    @Exclude()
    setSelect(select: string[]): FindOptionsDto {
        this.select = this.setArrayValue(select, this.select);

        return this;
    }

    @Exclude()
    setInclude(include: string[] | IInclude): FindOptionsDto {
        if (include instanceof Array) {
            this.include = this.setArrayValue(include, this.include);
        } else {
            this.include = this.setObjectValue(include, this.include);
        }

        return this;
    }

    @Exclude()
    setSort(sort: object): FindOptionsDto {
        this.sort = this.setObjectValue(sort, this.sort);

        return this;
    }

    @Exclude()
    setIncludeDeleted(include: boolean): FindOptionsDto {
        this.includeDeleted = include;

        return this;
    }

    protected setArrayValue(value: string[], currentValue?: string): string {
        if (currentValue) {
            let parsedCurrentValue = JSON.parse(currentValue);

            parsedCurrentValue = [...parsedCurrentValue, ...value];

            return JSON.stringify(parsedCurrentValue);
        } else {
            return JSON.stringify(value);
        }
    }

    protected setObjectValue(value: object, currentValue?: string): string {
        if (currentValue) {
            let parsedCurrentValue = JSON.parse(currentValue);

            parsedCurrentValue = { ...parsedCurrentValue, ...value };

            return JSON.stringify(parsedCurrentValue);
        } else {
            return JSON.stringify(value);
        }
    }
}
