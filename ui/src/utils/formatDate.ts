import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const userTimezone = 'Asia/Kolkata';

/**
 * Formats an ISO date string to a human-readable string in the user's timezone.
 *
 * @function formatDateTime
 * @param {string} isoString - The ISO date string to format.
 * @returns {string} The formatted date and time string in 'DD MMM YYYY hh:mm:ss A' format.
 */
export function formatDateTime(isoString: string): string {
  return dayjs.utc(isoString).tz(userTimezone).format('DD MMM YYYY hh:mm:ss A');
}
