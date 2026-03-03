import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendOtp(to: string, otp: string, type: 'register' | 'reset' | 'login') {
    const subjects = {
      register: '🎉 Mã xác nhận đăng ký tài khoản',
      reset: '🔐 Mã đặt lại mật khẩu',
      login: '✅ Mã đăng nhập của bạn',
    };
    await this.mailer.sendMail({
      to,
      subject: subjects[type],
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1677ff; margin-bottom: 4px;">EShop</h2>
          <p>Mã xác nhận của bạn là:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1677ff; margin: 16px 0;">${otp}</div>
          <p style="color: #888; font-size: 13px;">Mã có hiệu lực trong <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với ai.</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(to: string, orderCode: string, totalAmount: string) {
    await this.mailer.sendMail({
      to,
      subject: `📦 Đặt hàng thành công - Mã đơn: ${orderCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #1677ff;">Cảm ơn bạn đã mua hàng tại EShop! 🎉</h2>
          <p>Đơn hàng <strong>${orderCode}</strong> của bạn đã được ghi nhận.</p>
          <p>Tổng thanh toán: <strong style="color: #f5222d;">${totalAmount}</strong></p>
          <p>Chúng tôi sẽ liên hệ sớm để xác nhận. Cảm ơn!</p>
        </div>
      `,
    });
  }
}
