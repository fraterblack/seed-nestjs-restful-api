export interface IQueueOptions {
    /**
     * Optional priority value. ranges from 1 (highest priority) to MAX_INT  (lowest priority).
     * Note that using priorities has a slight impact on performance, so do not use it if not required
     */
    priority?: number;

    /**
     * An amount of miliseconds to wait until this job can be processed.
     * Note that for accurate delays, both server and clients should have their clocks synchronized. [optional]
     */
    delay?: number;
}
