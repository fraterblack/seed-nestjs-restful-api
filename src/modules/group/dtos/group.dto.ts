import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

import { BaseDto } from '../../../core/common/dtos/base-dto';

@Exclude()
export class GroupDto extends BaseDto<GroupDto> {
    @Expose()
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    @ApiProperty()
    name: string;

    @Expose()
    @IsBoolean()
    @IsOptional()
    @ApiPropertyOptional({ description: 'Default: true' })
    active: boolean;
}
