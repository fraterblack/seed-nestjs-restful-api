import dayjs, { OpUnitType } from 'dayjs';

export class DateHelper {
    /**
     * Parse all Date attribute of object to Date ISO string
     *
     * @param {{}} obj
     * @returns
     * @memberof ApiService
     */
    static transformDatesToDateIsoString(obj: {}) {
        for (const propName in obj) {
            if (obj.hasOwnProperty(propName)) {
                if (obj[propName] instanceof Date) {
                    obj[propName] = dayjs(obj[propName]).toISOString();
                }
            }
        }

        return obj;
    }

    /**
     * Parse all date ISO string attribute of object to Date
     *
     * @template T
     * @param {{}} obj
     * @param {boolean} recursively
     * @returns {T}
     * @memberof DateHelper
     */
    static transformDatesIsoStringToDate<T>(obj: {}, recursively = false): T {
        for (const propName in obj) {
            if (obj.hasOwnProperty(propName)) {
                if (recursively && typeof obj[propName] === 'object') {
                    DateHelper.transformDatesIsoStringToDate(obj[propName], recursively);
                }

                if (typeof obj[propName] === 'string') {
                    const isDate = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(obj[propName]);

                    if (isDate) {
                        obj[propName] = dayjs(obj[propName]).toDate();
                    }
                }
            }
        }

        return obj as T;
    }

    /**
     * Returns a Date without a time defined
     *
     * @static
     * @returns Date
     * @memberof DateHelper
     */
    static currentDate(): Date {
        return dayjs().hour(0).minute(0).second(0).millisecond(0).toDate();
    }

    /**
     * Reset time of Date
     *
     * @static
     * @param {(dayjs.Dayjs | Date)} date
     * @returns Date
     * @memberof DateHelper
     */
    static resetTime(date: dayjs.Dayjs | Date): dayjs.Dayjs | Date {
        const parsedDate = dayjs(date).hour(0).minute(0).second(0).millisecond(0);

        if (date instanceof Date) {
            return parsedDate.toDate();
        }

        return parsedDate;
    }

    /**
     * Check if a target date is between two given dates
     *
     * @param target Date target
     * @param dA Initial Date
     * @param dB Final Date
     * @param unity Unit of measure
     * @param inclusive Inclusive
     */
    static isBetween(target: dayjs.Dayjs, dA: dayjs.Dayjs, dB: dayjs.Dayjs, unity?: OpUnitType, inclusive = false): boolean {
        return (
            target.isAfter(dA, unity) || (inclusive && target.isSame(dA, unity))
        ) && (
                target.isBefore(dB, unity) || (inclusive && target.isSame(dB, unity))
            );
    }

    /**
     * Given time string, returns a dayjs instance of day with given hour
     *
     * @param time Time string
     * @param strict Throw error when invalid
     */
    static parseToDate(time: string, strict = true): dayjs.Dayjs {
        return dayjs(time, ['HH:mm:ss', 'HH:mm', 'HH:m'], strict);
    }
}
