import { Duration } from './duration.interface';

export interface Time extends String {
  duration(strict?: boolean): Duration;
  format(shortFormat?: boolean): string;
}
