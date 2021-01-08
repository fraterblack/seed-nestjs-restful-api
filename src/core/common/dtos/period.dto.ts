import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, Validate } from 'class-validator';

import { DateOnlyValidator } from './../class-validators/date-only.validator';

@Exclude()
export class PeriodDto {
    @Expose()
    @Validate(DateOnlyValidator)
    @IsNotEmpty()
    @ApiProperty()
    start: string;

    @Expose()
    @Validate(DateOnlyValidator)
    @IsNotEmpty()
    @ApiProperty()
    end: string;
}
