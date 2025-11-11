import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './mailer.service';
import { SendEmailDto } from './dto/send-email.dto';
import { SendBulkDto } from './dto/send-bulk.dto';

@Controller('api/email')
export class EmailController {
    constructor(private readonly emailService: EmailService) { }

    @Post('send')
    async sendEmail(@Body() body: SendEmailDto) {
        try {
            if (!body.text && !body.html) {
                throw new HttpException('text or html is required', HttpStatus.BAD_REQUEST);
            }

            const result = await this.emailService.sendMail({
                to: body.to,
                subject: body.subject,
                text: body.text,
                html: body.html,
            });

            return { ok: true, ...result };
        } catch (err) {
            throw new HttpException({ ok: false, message: err.message || 'Send failed' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('send-bulk')
    async sendEmailBulk(@Body() body: SendBulkDto) {
        try {

            const results = [{}];
            for (const item of body.emails) {
                const res = await this.emailService.sendMail({
                    to: item.to,
                    subject: item.subject,
                    text: item.text,
                    html: item.html,
                });
                results.push(res);
            }

            return { ok: true, results };
        } catch (err) {
            throw new HttpException({ ok: false, message: err.message || 'Send failed' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
