import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { v4 } from 'uuid/interfaces';

export class FindOneParamsDto {
    @IsUUID()
    @ApiProperty()
    id: v4;
}
