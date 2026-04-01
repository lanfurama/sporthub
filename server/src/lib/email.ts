import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, text } = options;

  if (!env.SENDGRID_API_KEY) {
    console.warn('[Email] SendGrid API key not configured, skipping email send');
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return true;
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: env.SENDGRID_FROM_EMAIL },
        subject,
        content: [
          { type: 'text/html', value: html },
          ...(text ? [{ type: 'text/plain', value: text }] : []),
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

export async function sendBookingConfirmation(email: string, bookingRef: string, courtName: string, date: string, time: string): Promise<boolean> {
  const html = `
    <h2>Xác nhận đặt sân thành công</h2>
    <p>Mã đặt sân của bạn: <strong>${bookingRef}</strong></p>
    <p>Sân: ${courtName}</p>
    <p>Ngày: ${date}</p>
    <p>Giờ: ${time}</p>
    <p>Vui lòng đến đúng giờ đã đặt.</p>
  `;
  
  return sendEmail({
    to: email,
    subject: `Xác nhận đặt sân ${bookingRef}`,
    html,
  });
}

export async function sendMembershipExpiryWarning(email: string, planName: string, expiryDate: string): Promise<boolean> {
  const html = `
    <h2>Cảnh báo gói thành viên sắp hết hạn</h2>
    <p>Gói ${planName} của bạn sẽ hết hạn vào ngày ${expiryDate}.</p>
    <p>Vui lòng gia hạn để tiếp tục hưởng các quyền lợi thành viên.</p>
  `;
  
  return sendEmail({
    to: email,
    subject: 'Gói thành viên sắp hết hạn',
    html,
  });
}
