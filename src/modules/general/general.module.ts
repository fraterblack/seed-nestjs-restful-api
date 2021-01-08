import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../../core/authorization/auth.module';
import { CheckModule } from './check/check.module';

@Module({
    imports: [
        CheckModule,

        AuthModule,
        PassportModule,
    ],
})
export class GeneralModule { }
