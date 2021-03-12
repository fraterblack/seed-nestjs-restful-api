import { HttpModule as NestHttpModule, Module } from '@nestjs/common';

import { ContextModule } from '../context/context.module';
import { InnerHttpService } from './inner-http.service';

@Module({
    imports: [
        ContextModule,
        NestHttpModule,
    ],
    providers: [
        InnerHttpService,
    ],
    exports: [
        InnerHttpService,
    ],
})
export class HttpModule { }
