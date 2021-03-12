import { ContextData } from '../../context/context-data';
import { IJobEvent } from './job-event.interface';

export interface IJobHandler<T = IJobEvent> {
    execute(event: T, context: ContextData, requestId?: any): Promise<any>;
}
