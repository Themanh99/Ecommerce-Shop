type DateInput = Date | string | number;

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

let dayjsLib: any = null;

try {
  // Optional runtime dependency. If unavailable, native Date fallback is used.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dayjs = require('dayjs');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const customParseFormat = require('dayjs/plugin/customParseFormat');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const timezone = require('dayjs/plugin/timezone');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const utc = require('dayjs/plugin/utc');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dayjs/locale/vi');

  dayjs.extend(customParseFormat);
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.locale('vi');
  dayjsLib = dayjs;
} catch {
  dayjsLib = null;
}

const toDate = (value: DateInput): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

export const formatDate = (
  date: DateInput,
  format = 'DD/MM/YYYY HH:mm:ss',
): string => {
  if (dayjsLib) {
    return dayjsLib(date).tz(DEFAULT_TIMEZONE).format(format);
  }

  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: DEFAULT_TIMEZONE,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  if (format === 'DD/MM/YYYY HH:mm:ss') {
    const parts = formatter
      .formatToParts(toDate(date))
      .reduce<Record<string, string>>((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {});

    return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
  }

  return formatter.format(toDate(date));
};

export const addMinutes = (date: DateInput, amount: number): Date => {
  if (dayjsLib) {
    return dayjsLib(date).add(amount, 'minute').toDate();
  }

  return new Date(toDate(date).getTime() + amount * 60 * 1000);
};

export const addHours = (date: DateInput, amount: number): Date => {
  if (dayjsLib) {
    return dayjsLib(date).add(amount, 'hour').toDate();
  }

  return new Date(toDate(date).getTime() + amount * 60 * 60 * 1000);
};

export const addDays = (date: DateInput, amount: number): Date => {
  if (dayjsLib) {
    return dayjsLib(date).add(amount, 'day').toDate();
  }

  return new Date(toDate(date).getTime() + amount * 24 * 60 * 60 * 1000);
};

export const isExpired = (expiresAt: DateInput): boolean => {
  if (dayjsLib) {
    return dayjsLib().isAfter(dayjsLib(expiresAt));
  }

  return Date.now() > toDate(expiresAt).getTime();
};

export const getUnixTimestamp = (date: DateInput): number => {
  if (dayjsLib) {
    return dayjsLib(date).unix();
  }

  return Math.floor(toDate(date).getTime() / 1000);
};

export const parseDate = (
  dateString: string,
  format = 'YYYY-MM-DDTHH:mm:ss',
): Date => {
  if (dayjsLib) {
    return dayjsLib.tz(dateString, format, DEFAULT_TIMEZONE).toDate();
  }

  return new Date(dateString);
};
