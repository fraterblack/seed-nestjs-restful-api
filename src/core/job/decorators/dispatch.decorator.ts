import { SetMetadata } from '@nestjs/common';

import { IJobEvent } from '../interfaces/job-event.interface';
import { JOB_DISPATCH } from '../job.constant';

export function Dispatch(event: IJobEvent): MethodDecorator;
export function Dispatch(
    event: IJobEvent,
): MethodDecorator {
    return SetMetadata(JOB_DISPATCH, { event });
}
