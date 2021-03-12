import dayjs from 'dayjs';

const BRAZIL_OFFSET = -180;

/**
 * Wrapper to create date with properly utcOffset
 *
 * @param date
 * @param option
 * @param locale
 */
export function iDateOffset(
    date?: dayjs.ConfigType,
    option?: dayjs.OptionType,
    locale?: string): dayjs.Dayjs {
    return dayjs(date, option, locale).utcOffset(BRAZIL_OFFSET);
}

/**
 * Wrapper to create date with properly utcOffset
 *
 * @param date
 * @param option
 * @param locale
 */
export function iDate(
    date?: dayjs.ConfigType,
    option?: dayjs.OptionType,
    locale?: string): dayjs.Dayjs {
    return dayjs(date, option, locale);
}
