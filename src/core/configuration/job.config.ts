import { BullModuleOptions } from '@nestjs/bull';

import { JobQueue } from '../job/job-queue.enum';
import config from './config';

export class JobConfig {
    static readonly DEFAULT_LIMITER = 20;
    static readonly DEFAULT_DURATION = 6000;

    /**
     * @see https://github.com/OptimalBits/bull/blob/master/REFERENCE.md#queue
     */
    static getDefaultJobConfig(): BullModuleOptions[] {
        // Queue Job Configuration
        return [
            {
                name: JobQueue.MAIN,
                limiter: {
                    max: config.getAsNumber('QUEUE_LIMITER_MAX', JobConfig.DEFAULT_LIMITER),
                    duration: config.getAsNumber('QUEUE_LIMITER_DURATION', JobConfig.DEFAULT_DURATION),
                },
                redis: {
                    host: config.getAsString('QUEUE_HOST'),
                    port: config.getAsNumber('QUEUE_PORT'),
                },
            },
        ];
    }
}
