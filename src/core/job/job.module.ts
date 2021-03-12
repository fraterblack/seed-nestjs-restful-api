import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { ContextModule } from '../context/context.module';
import { JobDispatcher } from './job-dispatcher';
import { JobMetadataAccessor } from './job-metadata.accessor';
import { JobExplorer } from './job.explorer';

@Module({})
export class JobModule {
    static forRoot(): DynamicModule {
        return {
            module: JobModule,
            imports: [
                {
                    global: true,
                    module: JobModule,
                    imports: [
                        DiscoveryModule,
                        ContextModule,
                    ],
                    providers: [
                        JobDispatcher,
                        JobExplorer,
                        JobMetadataAccessor,
                    ],
                    exports: [
                        JobDispatcher,
                    ],
                },
            ],
        };
    }
}
