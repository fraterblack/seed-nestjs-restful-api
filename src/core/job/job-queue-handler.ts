import { Job, JobOptions, Queue } from 'bull';

import config from '../configuration/config';
import { Context } from '../context/context';
import { IJobData } from './interfaces/job-data.interface';
import { IJobOptions } from './interfaces/job-options.interface';

export class JobQueueHandler {
    constructor(private readonly queue: Queue) { }

    /**
     * Add a new delayed job to queue
     *
     * @param name Job name
     * @param data Data to be resolved
     * @param opts Options
     */
    async add<T>(name: string, object: T, opts?: IJobOptions): Promise<Job<T>> {
        opts = opts || {};

        if (!opts.delay) {
            opts.delay = config.getAsNumber('QUEUE_DELAY');
        }

        return this.addAndRun(name, object, opts);
    }

    /**
     * Add a new not delayed job to queue
     *
     * @param name Job name
     * @param data Data to be resolved
     * @param opts Options
     */
    async addAndRun<T>(name: string, object: T, opts?: IJobOptions): Promise<Job<T>> {
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

        const context = Context.getData();

        const data: IJobData<T> = {
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
