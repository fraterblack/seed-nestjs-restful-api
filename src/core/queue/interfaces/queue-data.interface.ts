import { ContextData } from '../../context/context-data';

export interface IQueueData<T> {
    /**
     * Data Object handle by the JOB
     */
    object: T;

    /**
     * Context data handle by the JOB
     */
    context?: ContextData;
}
