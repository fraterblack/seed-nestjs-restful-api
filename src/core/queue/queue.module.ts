import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { QueueConfig } from '../configuration/queue.config';
import { ContextMiddleware } from '../context/context.middleware';
import { ContextModule } from '../context/context.module';
import { QueueResolverService } from './queue-resolver.service';
import { UncontextedQueueResolverService } from './uncontexted-queue-resolver.service';

@Module({
    imports: [
        ContextModule,
        JwtModule.register({}),
        BullModule.registerQueue(...QueueConfig.getDefaultQueueConfig()),
    ],
    providers: [
        QueueResolverService,
        UncontextedQueueResolverService,
    ],
    exports: [
        QueueResolverService,
        UncontextedQueueResolverService,
    ],
})
export class QueueModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ContextMiddleware)
            .forRoutes('(.*)');
    }
}
