import { Job, JobOptions, Queue } from 'bull';

import config from '../configuration/config';
import { ContextData } from '../context/context-data';
import { IQueueData } from './interfaces/queue-data.interface';
import { IQueueOptions } from './interfaces/queue-options.interface';

export class QueueHandler {
    constructor(private readonly queue: Queue) { }

    /**
     * Add a new delayed job to queue
     *
     * @param name Job name
     * @param data Data to be resolved
     * @param opts Options
     */
    async add<T>(name: string, object: T, context = {} as ContextData, opts?: IQueueOptions): Promise<Job<T>> {
        opts = opts || {};

        if (!opts.delay) {
            opts.delay = config.getAsNumber('QUEUE_DELAY');
        }

        return this.addAndRun(name, object, context, opts);
    }

    /**
     * Add a new not delayed job to queue
     *
     * @param name Job name
     * @param data Data to be resolved
     * @param context ContextData replicate along processing
     * @param opts Options
     */
    async addAndRun<T>(name: string, object: T, context = {} as ContextData, opts?: IQueueOptions): Promise<Job<T>> {
        opts = opts || {};

        if (!opts.delay) {
            opts.delay = 0;
        }

        const jobOptions: JobOptions = {
            ...opts,
            attempts: config.getAsNumber('QUEUE_ATTEMPTS'),
            backoff: {
                type: 'fixed',
                delay: config.getAsNumber('QUEUE_BACKOFF'),
            },
        };

        const data: IQueueData<T> = {
            object,
            context,
        };

        return await this.queue.add(name, data, jobOptions);
    }

    /**
     * Returns queue manager
     */
    manager(): Queue {
        return this.queue;
    }
}
