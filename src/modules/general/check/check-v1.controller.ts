import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { StrategyType } from '../../../core/authorization/strategy-types';
import { MessageDto } from '../../../core/common/dtos/message.dto';

@ApiTags('check')
@Controller('v1/check')
@UseGuards(AuthGuard(StrategyType.AUTH))
export class CheckV1Controller {
    constructor() { }

    @Get('status')
    @ApiOperation({ summary: 'Check service is On' })
    @ApiOkResponse({ type: MessageDto })
    async status(): Promise<MessageDto> {
        return {
            message: 'API Collector Service is On',
            details: new Date().toISOString(),
        };
    }
}
