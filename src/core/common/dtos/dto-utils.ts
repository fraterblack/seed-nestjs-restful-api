import dayjs from 'dayjs';
import { v4 } from 'uuid/interfaces';

import { Identifier } from './../enums/identifier.enum';
import { TimeHelper } from './../utils/time-helper';

export function handleSingleRelationId<D>(value: D, relationId: v4, identifier = 'id', nullable = false): D {
    if (!value && relationId && relationId.toString() !== Identifier.EMPTY) {
        return new Object({ id: relationId }) as D;
    }

    if (value && !value[identifier] && !nullable) {
        return undefined;
    }

    return value;
}

export function handleManyRelationId<D>(value: D[], obj: any, identifier = 'id', filterValidValues = false): D[] {
    // Filter null values
    const validValues = (value || []).filter(i => i[identifier]);

    if (obj._previousDataValues && (!validValues || !validValues.length)) {
        return undefined;
    }

    return filterValidValues ? validValues : value;
}

export function handleHasOne<D>(value: D, obj: any, identifier = 'id'): D {
    if (/*obj._previousDataValues && */(!value || !value[identifier])) {
        return undefined;
    }

    return value;
}

export function handleTimeString(value: any): string {
    if (value) {
        const duration = TimeHelper.parseDuration(value, true);
        return TimeHelper.formatTime(duration, true);
    }

    return value;
}

export function transformIntervalToTimeString(value: any): string {
    if (value) {
        const duration = dayjs.duration(value);
        return TimeHelper.formatTime(duration, true);
    }

    return value;
}
