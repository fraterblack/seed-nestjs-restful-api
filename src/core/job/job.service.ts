import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { JobQueueHandler } from './job-queue-handler';
import { JobQueue } from './job-queue.enum';

@Injectable()
export class JobService {
    constructor(
        @InjectQueue(JobQueue.MAIN) private readonly mainQueue: Queue,
    ) { }

    /**
     * Get Queue by name
     * @param JobQueue Available queue
     */
    queue(name: JobQueue): JobQueueHandler {
        switch (name) {
            case JobQueue.MAIN:
                return new JobQueueHandler(this.mainQueue);
        }
    }
}
