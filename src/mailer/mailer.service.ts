import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = (process.env.SMTP_SECURE ?? 'true') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    // optional: verify connection at startup
    this.transporter.verify().then(() => {
      this.logger.log('SMTP connection OK');
    }).catch(err => {
      this.logger.warn('SMTP connection failed: ' + err.message);
    });
  }

  async sendMail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    fromName?: string;
    fromEmail?: string;
  }) {
    const fromName = options.fromName || process.env.FROM_NAME || undefined;
    const fromEmail = options.fromEmail || process.env.FROM_EMAIL || process.env.SMTP_USER;
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail;

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
      this.logger.error('Send mail error: ' + (error?.message ?? error));
      throw error;
    }
  }
}
