import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { v4 } from 'uuid';

import { FindOneParamsDto } from '../../core/common/dtos/find-one-params.dto';
import { FindOptionsDto } from './../../core/database/query/dtos/find-options.dto';
import { QueryOptionsDto } from './../../core/database/query/dtos/query-options.dto';
import { QueryResponseDto } from './../../core/database/query/dtos/query-response.dto';
import { GroupDto } from './dtos/group.dto';
import { GroupService } from './group.service';

@ApiTags('groups')
@Controller('v1/groups')
// @UseGuards(AuthGuard(StrategyType.AUTH)) // Uncomment to activate guard
export class GroupV1Controller {
    constructor(
        private service: GroupService,
    ) { }

    @Post('')
    @ApiOkResponse({ type: GroupDto })
    async create(@Body() dto: GroupDto): Promise<GroupDto> {
        return await this.service.create(dto);
    }

    @Put(':id')
    @ApiParam({ name: 'id', type: v4 })
    @ApiOkResponse({ type: GroupDto })
    async update(@Param() params: FindOneParamsDto, @Body() dto: GroupDto): Promise<GroupDto> {
        dto.id = params.id;

        return await this.service.update(dto);
    }

    @Delete(':id')
    @ApiParam({ name: 'id', type: v4 })
    @ApiOkResponse({ type: Number, description: 'The number of delete rows' })
    async delete(@Param() params: FindOneParamsDto): Promise<number> {
        return await this.service.delete(params.id);
    }

    @Get('')
    @ApiOperation({ summary: 'Queryable' })
    @ApiOkResponse({ type: QueryResponseDto })
    async find(@Query() queryOptionsDto?: QueryOptionsDto): Promise<QueryResponseDto<GroupDto>> {
        return await this.service.query(queryOptionsDto);
    }

    @Get(':id')
    @ApiParam({ name: 'id', type: v4 })
    @ApiOkResponse({ type: GroupDto })
    async findOne(@Param() params: FindOneParamsDto, @Query() options?: FindOptionsDto): Promise<GroupDto> {
        return await this.service.findOne(params.id, options);
    }
}
