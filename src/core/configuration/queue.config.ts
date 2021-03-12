import { BullModuleOptions } from '@nestjs/bull';

import { QueueName } from '../queue/queue-name.enum';
import config from './config';

export class QueueConfig {
    static getDefaultQueueConfig(): BullModuleOptions[] {
        // Queue Job Configuration
        return [
            {
                name: QueueName.MAIN,
                limiter: {
                    max: config.getAsNumber('QUEUE_LIMITER_MAX', 20),
                    duration: config.getAsNumber('QUEUE_LIMITER_DURATION', 60000),
                },
                redis: {
                    host: config.getAsString('QUEUE_HOST'),
                    port: config.getAsNumber('QUEUE_PORT'),
                },
            },
        ];
    }
}
