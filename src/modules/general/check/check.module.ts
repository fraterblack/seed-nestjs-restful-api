import { CacheModule, Module } from '@nestjs/common';

import { SupportModule } from './../../../support/support.module';
import { CheckV1Controller } from './check-v1.controller';

@Module({
    imports: [
        SupportModule,

        CacheModule.register(),
    ],
    controllers: [
        CheckV1Controller,
    ],
})
export class CheckModule { }
