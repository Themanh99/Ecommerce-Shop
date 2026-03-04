import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { APP_TIMEOUTS } from '../common/constants/app.constants';
import { formatDate } from '../common/utils/date.util';
import { truncateText } from '../common/utils/string.util';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendOtp(to: string, otp: string, type: 'register' | 'reset' | 'login') {
    const subjects = {
      register: '[EShop] Ma xac nhan dang ky tai khoan',
      reset: '[EShop] Ma dat lai mat khau',
      login: '[EShop] Ma dang nhap cua ban',
    };

    const sentAt = formatDate(new Date());

    await this.mailer.sendMail({
      to,
      subject: subjects[type],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1677ff; margin-bottom: 4px;">EShop</h2>
          <p>Ma xac nhan cua ban la:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1677ff; margin: 16px 0;">${otp}</div>
          <p style="color: #888; font-size: 13px;">Ma co hieu luc trong <strong>${APP_TIMEOUTS.OTP_MINUTES} phut</strong>. Vui long khong chia se ma nay voi ai.</p>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">Thoi gian gui: ${sentAt}</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(to: string, orderCode: string, totalAmount: string) {
    const shortOrderCode = truncateText(orderCode, 32);
    const shortTotalAmount = truncateText(totalAmount, 48);
    const sentAt = formatDate(new Date());

    await this.mailer.sendMail({
      to,
      subject: `[EShop] Dat hang thanh cong - Ma don: ${shortOrderCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1677ff;">Cam on ban da mua hang tai EShop</h2>
          <p>Don hang <strong>${shortOrderCode}</strong> cua ban da duoc ghi nhan.</p>
          <p>Tong thanh toan: <strong style="color: #f5222d;">${shortTotalAmount}</strong></p>
          <p>Chung toi se lien he som de xac nhan.</p>
          <p style="color: #888; font-size: 12px; margin-top: 16px;">Thoi gian gui: ${sentAt}</p>
        </div>
      `,
    });
  }
}
