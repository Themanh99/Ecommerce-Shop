import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

/** Format: 15:30 - 24/09/2024 */
export const formatDateTime = (date: string | Date): string =>
  dayjs(date).format('HH:mm - DD/MM/YYYY');

/** Format: 24/09/2024 */
export const formatDate = (date: string | Date): string =>
  dayjs(date).format('DD/MM/YYYY');

/** Format VN currency: 1000000 -> "1.000.000₫" */
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

/** Validate VN phone regex */
export const isVietnamesePhone = (phone: string): boolean =>
  /^(0|\+84)(3[2-9]|5[6-9]|7[0|6-9]|8[0-9]|9[0-9])[0-9]{7}$/.test(phone);

/** Simple email regex */
export const isEmail = (input: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

/** Mask email: n****@gmail.com */
export const maskEmail = (email: string): string => {
  const [name, domain] = email.split('@');
  return `${name[0]}${'*'.repeat(Math.max(name.length - 1, 3))}@${domain}`;
};

/** Mask phone: 098****567 */
export const maskPhone = (phone: string): string =>
  `${phone.slice(0, 3)}****${phone.slice(-3)}`;
