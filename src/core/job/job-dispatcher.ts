import { Inject, Injectable } from '@nestjs/common';
import { ContextIdFactory, REQUEST } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { ContextService } from '../context/context.service';
import { JobHandlerNotFoundException } from './exceptions/job-handler-not-found.exception';
import { IJobEvent } from './interfaces/job-event.interface';
import { JobExplorer } from './job.explorer';

@Injectable()
export class JobDispatcher {
    constructor(
        private readonly contextService: ContextService,
        private readonly jobExplorer: JobExplorer,
        @Inject(REQUEST) private request: FastifyRequest,
    ) { }

    async dispatchSync<T = any>(event: IJobEvent): Promise<T> {
        const handler: CallableFunction = this.jobExplorer.get(event);

        if (!handler) {
            throw new JobHandlerNotFoundException(event);
        }

        const context = this.contextService.getData();
        const contextId = ContextIdFactory.getByRequest(this.request);

        return await handler(event, context, contextId);
    }
}
