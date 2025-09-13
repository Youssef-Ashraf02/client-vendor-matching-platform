import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // For development, use Ethereal (https://ethereal.email/) or your SMTP config
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMatchNotification(to: string, projectId: number, vendorId: number, score: number) {
    const info = await this.transporter.sendMail({
      from: '"Expanders" <no-reply@expanders360.com>',
      to,
      subject: `New Match for Project ${projectId}`,
      text: `Project ${projectId} matched with Vendor ${vendorId} (score: ${score})`,
    });
    this.logger.log(`Email sent: ${info.messageId}`);
    this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const info = await this.transporter.sendMail({
      from: '"Expanders 360" <no-reply@expanders360.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
      html,
    });
    this.logger.log(`Email sent to ${to}: ${info.messageId}`);
    this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  }
}