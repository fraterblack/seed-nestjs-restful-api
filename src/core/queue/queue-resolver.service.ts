import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { QueueHandler } from './queue-handler';
import { QueueName } from './queue-name.enum';

@Injectable()
export class QueueResolverService {
    constructor(
        @InjectQueue(QueueName.MAIN) private readonly mainQueue: Queue,
    ) { }

    /**
     * Get Queue by name
     * @param name Queue name
     * @param context Context
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
