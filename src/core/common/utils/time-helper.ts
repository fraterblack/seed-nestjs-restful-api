import dayjs from 'dayjs';
import { round } from 'lodash';

import { Duration } from '../interfaces/duration.interface';

export class TimeHelper {
  /**
   * Given two times, return interval between them
   *
   * @param {string} startTime
   * @param {string} finishTime
   * @returns Duration
   */
  static getInterval(
    startTime: string,
    finishTime: string): Duration {

    const date1 = dayjs(startTime, ['HH:mm:ss', 'HH:mm', 'HH:m'], true);
    let date2 = dayjs(finishTime, ['HH:mm:ss', 'HH:mm', 'HH:m'], true);
    let interval = date2.diff(date1);

    // If interval is negative, mean workday start in a day and finish at the next
    if (interval < 0) {
      date2 = date2.add(24, 'hour');

      interval = date2.diff(date1);
    }

    return dayjs.duration(interval);
  }

  /**
   * Parse string time to Duration
   *
   * @param {string} time
   * @returns
   */
  static parseDuration(time: string, strict = true): Duration {
    const fragments = time.split(':');

    if (fragments.length < 2) {
      // Try to extract a duration from ISO string
      const durationFromIso = dayjs.duration(time);

      if (durationFromIso && durationFromIso.asSeconds()) {
        return durationFromIso;
      }

      if (strict) {
        throw Error(`Invalid time string format: ${time}`);
      }

      return dayjs.duration(0);
    }

    const hours = parseInt(fragments[0], 0);
    const minutes = parseInt(fragments[1], 0);
    const seconds = parseInt(fragments[2] || '0', 0);

    const duration = dayjs.duration({
      seconds,
      minutes,
    });

    return duration.add(hours, 'hours');
  }

  /**
   * Given time parse it
   *
   * @static
   * @param {string} time
   * @param {bool} nullable
   * @returns {string}
   * @memberof DateHelper
   */
  static parseTime(time: string, nullable = false): string {
    let parsedTime = time === '000:00' ? '00:00' : time;

    // Check time is valid
    const firstCheck = /^[0-9]{2,}:[0-5]{1}[0-9]{1}$/.test(time);

    // If is invalid
    if (!firstCheck) {
      // if pass in the check below, it consired that minutes is wrong
      const secondCheck = /^([0-9]{2,}):([0-9]{2})$/.exec(time);

      if (secondCheck) {
        parsedTime = `${secondCheck[1]}:59`;
      } else {
        parsedTime = null;
      }
    }

    return !parsedTime ? (nullable ? null : '00:00') : parsedTime;
  }

  /**
   * Format Duration to time format 00:00:00
   *
   * @param {Duration} duration
   * @param {shortFormat} Ignore second when formating time
   * @returns
   */
  static formatTime(duration: Duration, shortFormat = false) {
    const hours = TimeHelper.reduceHours(duration).toString().padStart(2, '0');
    const minutes = (duration.minutes() || 0).toString().padStart(2, '0');
    const seconds = (duration.seconds() || 0).toString().padStart(2, '0');

    return `${hours}:${minutes}` + (!shortFormat ? `:${seconds}` : '');
  }

  /**
   * Format minutes to time format 000:00
   *
   * @param {number} minutes
   * @param {boolean} onlyPositive Returns a time without negative value
   * @returns
   */
  static formatTimeFromMinutes(minutes: number, onlyPositive = true) {
    const absMinutes = Math.abs(minutes);

    let hours = Math.floor(absMinutes / 60);
    let restMinutes = round(absMinutes - (hours * 60), 0);

    // Ensure after round minutes is properly converted
    if (restMinutes === 60) {
      restMinutes = 0;
      hours++;
    } else if (restMinutes > 60) {
      throw new Error(`Error on format time. ${restMinutes} is invalid`);
    }

    return `${minutes < 0 && !onlyPositive ? '-' : ''}${hours.toString().padStart(2, '0')}:${restMinutes.toString().padStart(2, '0')}`;
  }

  /**
   * Convert time string (HH:mm or mm:ss) to decimal
   *
   * @static
   * @param {string} time
   * @returns number
   */
  static timeStringToDecimal(time: string): number {
    const splittedValue = time.split(':');

    // Convert seconds to decimal
    return parseInt(splittedValue[0], 10) + parseInt(splittedValue[1], 10) / 60;
  }

  /**
   * Given a Duration, based on hours, days, months and years returns a sum of hours
   *
   * @param {Duration} duration
   * @returns {number}
   */
  private static reduceHours(duration: Duration): number {
    let hours = duration.hours() || 0;

    if (duration.days()) {
      hours += parseInt(duration.days().toString(), 0) * 24;
    }

    if (duration.months()) {
      hours += parseInt(duration.months().toString(), 0) * 30;
    }

    if (duration.years()) {
      throw new Error('Is not possible to reduce years');
    }

    return hours;
  }
}
