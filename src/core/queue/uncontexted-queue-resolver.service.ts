import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { QueueHandler } from './queue-handler';
import { QueueName } from './queue-name.enum';

/**
 * Queue handler service resolver that not pass context to QueueHandler
 *
 * @export
 * @class UncontextedQueueResolverService
 */
@Injectable()
export class UncontextedQueueResolverService {
    constructor(
        @InjectQueue(QueueName.MAIN) private readonly mainQueue: Queue,
    ) { }

    /**
     * Get Queue by name
     * @param QueueName Available queue
     */
    queue(name: QueueName): QueueHandler {
        switch (name) {
            case QueueName.MAIN:
                return new QueueHandler(this.mainQueue);
            default:
                return new QueueHandler(this.mainQueue);
        }
    }
}
