import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { v4 } from 'uuid/interfaces';

import { FindOptionsDto } from './../../core/database/query/dtos/find-options.dto';
import { QueryOptionsDto } from './../../core/database/query/dtos/query-options.dto';
import { QueryResponseDto } from './../../core/database/query/dtos/query-response.dto';
import { FindOptions } from './../../core/database/query/find-options';
import { QueryOptions } from './../../core/database/query/query-options';
import { GroupDto } from './dtos/group.dto';
import { Group } from './group.model';
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
    constructor(
        private readonly repository: GroupRepository,
    ) { }

    async create(dto: GroupDto): Promise<GroupDto> {
        const entity = plainToClass(Group, dto);

        const group = await this.repository.create(entity);

        return plainToClass(GroupDto, group);
    }

    async update(dto: GroupDto): Promise<GroupDto> {
        const entity = plainToClass(Group, dto);

        const group = await this.repository.update(entity);

        return plainToClass(GroupDto, group);
    }

    async delete(id: v4): Promise<number> {
        return this.repository.delete(id.toString());
    }

    async query(options: QueryOptionsDto): Promise<QueryResponseDto<GroupDto>> {
        const { page, limit } = options;

        const { rows, count } = await this.repository.paginatedQuery(plainToClass(QueryOptions, options));

        const mappedResults = plainToClass(GroupDto, rows);

        return new QueryResponseDto({
            results: mappedResults,
            total: count,
            page,
            limit,
        });
    }

    async findOne(id: v4, options?: FindOptionsDto): Promise<GroupDto> {
        if (!id) {
            throw new Error('Id is required');
        }

        const group = await this.repository.findOneOrFail(id.toString(), plainToClass(FindOptions, options));

        return plainToClass(GroupDto, group);
    }
}
