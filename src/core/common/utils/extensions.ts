import dayjs from 'dayjs';

import { Time } from './../interfaces/time.interface';
import { TimeHelper } from './time-helper';

declare global {
    interface String {
        asTime(): Time;
    }

    interface Date {
        toDateOnlyString(): string;
        toTimeOnlyString(): string;
    }
}

export function setExtensions() {
    /**
     * String
     */
    // tslint:disable-next-line: no-string-literal
    String.prototype['duration'] = function duration(strict) {
        return TimeHelper.parseDuration(this, strict);
    };

    // tslint:disable-next-line: no-string-literal
    String.prototype['format'] = function format(shortFormat?: boolean) {
        return TimeHelper.formatTime(TimeHelper.parseDuration(this), shortFormat);
    };

    String.prototype.asTime = function asTime() {
        return this;
    };

    /**
     * Date
     */
    Date.prototype.toDateOnlyString = function toDateOnlyString() {
        return dayjs(this).format('YYYY-MM-DD');
    };

    Date.prototype.toTimeOnlyString = function toDateOnlyString() {
        return dayjs(this).format('HH:mm');
    };
}

export { };
