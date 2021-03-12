import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IJobEvent } from './interfaces/job-event.interface';
import { JOB_DISPATCH, JOB_JOB } from './job.constant';

@Injectable()
export class JobMetadataAccessor {
    constructor(private readonly reflector: Reflector) { }

    isJobComponent(target: Type<any> | CallableFunction): boolean {
        if (!target) {
            return false;
        }
        return !!this.reflector.get(JOB_JOB, target);
    }

    isDispatcher(target: Type<any> | CallableFunction): boolean {
        if (!target) {
            return false;
        }
        return !!this.reflector.get(JOB_DISPATCH, target);
    }

    getJobComponentMetadata(target: Type<any> | CallableFunction): any {
        return this.reflector.get(JOB_JOB, target);
    }

    getDispatchMetadata(target: Type<any> | CallableFunction): { event: IJobEvent } {
        return this.reflector.get(JOB_DISPATCH, target);
    }
}
