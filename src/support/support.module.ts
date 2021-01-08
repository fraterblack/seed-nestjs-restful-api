import { Module } from '@nestjs/common';

import { HttpModule } from '../core/http/http.module';

@Module({
    imports: [
        HttpModule,
    ],
    providers: [
    ],
    exports: [
    ],
})
export class SupportModule { }
