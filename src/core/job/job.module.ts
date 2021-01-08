import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ContextMiddleware } from '../context/context.middleware';
import { JobConfig } from './../configuration/job.config';
import { JobService } from './job.service';

@Module({
    imports: [
        JwtModule.register({}),
        BullModule.registerQueue(...JobConfig.getDefaultJobConfig()),
    ],
    providers: [
        JobService,
    ],
    exports: [
        JobService,
    ],
})
export class JobModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ContextMiddleware)
            .forRoutes('(.*)');
    }
}
