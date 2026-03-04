import { randomBytes } from 'crypto';
import { camelCase, capitalize, kebabCase, startCase, truncate } from 'lodash';
import { REGEX_PATTERNS } from '../constants/app.constants';

export const slugify = (text: string): string =>
  kebabCase(
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, ''),
  );

export const truncateText = (text: string, length: number): string =>
  truncate(text, { length, omission: '...' });

export const capitalizeText = (text: string): string => capitalize(text);

export const toCamelCase = (text: string): string => camelCase(text);

export const toPascalCase = (text: string): string =>
  startCase(camelCase(text)).replace(/\s+/g, '');

export const validateEmail = (email: string): boolean =>
  REGEX_PATTERNS.EMAIL.test(email);

export const validatePhone = (phone: string): boolean =>
  REGEX_PATTERNS.VN_PHONE.test(phone);

export const generateSecureString = (length = 32): string =>
  randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

export const randomOtp = (digits = 6): string => {
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};

export const stripHtmlTags = (html: string): string =>
  html.replace(/<[^>]*>/g, '').trim();
