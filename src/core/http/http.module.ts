import { HttpModule as NestHttpModule, Module } from '@nestjs/common';

import { HttpWrapperService } from './http.service';

@Module({
    imports: [
        NestHttpModule,
    ],
    providers: [
        HttpWrapperService,
    ],
    exports: [
        HttpWrapperService,
    ],
})
export class HttpModule { }
