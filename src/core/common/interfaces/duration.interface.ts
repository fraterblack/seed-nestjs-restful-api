/**
 * Workround until be possible to use Duration interface directly from DayJs
 *
 * @export
 * @interface Duration
 */
export interface Duration {
    clone(): Duration;

    humanize(withSuffix: boolean): string;

    milliseconds(): number;
    asMilliseconds(): number;

    seconds(): number;
    asSeconds(): number;

    minutes(): number;
    asMinutes(): number;

    hours(): number;
    asHours(): number;

    days(): number;
    asDays(): number;

    weeks(): number;
    asWeeks(): number;

    months(): number;
    asMonths(): number;

    years(): number;
    asYears(): number;

    as(unit: string): number;

    get(unit: string): number;

    add(input: number | object | Duration, unit?: string): Duration;

    subtract(input: number | object | Duration, unit?: string): Duration;

    toJSON(): string;

    toISOString(): string;

    locale(locale: string): Duration;
}
