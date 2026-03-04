import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/vi';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('vi');

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const formatDate = (
  date: Date | string | number,
  format = 'DD/MM/YYYY HH:mm:ss',
) => dayjs(date).tz(DEFAULT_TIMEZONE).format(format);

export const addMinutes = (date: Date | string | number, amount: number) =>
  dayjs(date).add(amount, 'minute').toDate();

export const addHours = (date: Date | string | number, amount: number) =>
  dayjs(date).add(amount, 'hour').toDate();

export const addDays = (date: Date | string | number, amount: number) =>
  dayjs(date).add(amount, 'day').toDate();

export const isExpired = (expiresAt: Date | string | number) =>
  dayjs().isAfter(dayjs(expiresAt));

export const getUnixTimestamp = (date: Date | string | number) =>
  dayjs(date).unix();

export const parseDate = (
  dateString: string,
  format = 'YYYY-MM-DDTHH:mm:ss',
) => dayjs.tz(dateString, format, DEFAULT_TIMEZONE).toDate();
