import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MessageDto {
    @IsString()
    @ApiProperty()
    message: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    details: string;
}
