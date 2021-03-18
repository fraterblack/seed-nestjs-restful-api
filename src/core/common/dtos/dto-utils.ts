import { TransformFnParams } from 'class-transformer';
import dayjs from 'dayjs';
import { v4 } from 'uuid/interfaces';

import { Identifier } from './../enums/identifier.enum';
import { TimeHelper } from './../utils/time-helper';

export interface TransformParams<T = any> extends TransformFnParams {
    obj: T;
}

/**
 * Transform model foreign key in a relation DTO object
 * In other words, cityId foreign key is converted to:
 * CityDto {
 *     id: foreignKeyId
 * }
 *
 * @param {D} value
 * @param {v4} foreignKeyId
 * @param {string} [identifier='id']
 * @param {boolean} [nullable=false]
 * @returns {D}
 */
export function handleSingleRelationId<D>(value: D, foreignKeyId: v4, identifier = 'id', nullable = false): D {
    if (!value && foreignKeyId && foreignKeyId.toString() !== Identifier.EMPTY) {
        return new Object({ id: foreignKeyId }) as D;
    }

    if (value && !value[identifier] && !nullable) {
        return undefined;
    }

    return value;
}

/**
 * Transform HasMany relation ids to a list with DTO objects
 * @see handleSingleRelationId method description for more understanding
 *
 * @param {D[]} value
 * @param {*} obj
 * @param {string} [identifier='id']
 * @param {boolean} [filterValidValues=false]
 * @returns {D[]}
 */
export function handleManyRelationId<D>(value: D[], obj: any, identifier = 'id', filterValidValues = false): D[] {
    // Filter null values
    const validValues = (value || []).filter(i => i[identifier]);

    if (obj._previousDataValues && (!validValues || !validValues.length)) {
        return undefined;
    }

    return filterValidValues ? validValues : value;
}

/**
 * Transform HasOne relation id to a DTO object
 * @see handleSingleRelationId method description for more understanding
 *
 * @param {D} value
 * @param {*} obj
 * @param {string} [identifier='id']
 * @returns {D}
 */
export function handleHasOne<D>(value: D, obj: any, identifier = 'id'): D {
    if (/*obj._previousDataValues && */(!value || !value[identifier])) {
        return undefined;
    }

    return value;
}

/**
 * Transform given value to time string
 *
 * @param {*} value
 * @param {boolean} shortFormat When true, returns time without seconds
 * @returns {string}
 */
export function handleTimeString(value: any, shortFormat = true): string {
    if (value) {
        const duration = TimeHelper.parseDuration(value, true);
        return TimeHelper.formatTime(duration, shortFormat);
    }

    return value;
}

/**
 * Transform given Duration to a time string
 *
 * @param {*} value
 * @param {boolean} shortFormat When true, returns time without seconds
 * @returns {string}
 */
export function transformIntervalToTimeString(value: any, shortFormat = true): string {
    if (value) {
        const duration = dayjs.duration(value);
        return TimeHelper.formatTime(duration, shortFormat);
    }

    return value;
}
