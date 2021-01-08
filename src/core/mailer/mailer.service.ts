import { Nodemailer, NodemailerDrivers } from '@crowdlinker/nestjs-mailer';
import { Injectable } from '@nestjs/common';
import { SendMailOptions } from 'nodemailer';

import { ITemplateRender } from '../../core/mailer/interfaces/template-render.interface';

@Injectable()
export class MailerService {
    private emailFrom: string;
    private emailTo: string;
    private emailSubject: string;
    private emailHtmlMessage: string;
    private emailTextMessage: string;

    constructor(
        private readonly nodemailer: Nodemailer<NodemailerDrivers.SMTP>,
    ) { }

    /**
     * Initialize message to be sent
     *
     * @param template Email template or string message
     */
    send(template: ITemplateRender | string): MailerService {
        // Reset all settings
        this.reset();

        let htmlMessage: string;
        let textMessage: string;

        if (typeof template === 'object') {
            htmlMessage = template.renderHtml();
            textMessage = template.renderText();
        }

        this.emailTextMessage = textMessage || (template as string);
        this.emailHtmlMessage = htmlMessage || (template as string);

        return this;
    }

    from(from: string): MailerService {
        this.emailFrom = from;

        return this;
    }

    to(to: string): MailerService {
        this.emailTo = to;

        return this;
    }

    subject(subject: string): MailerService {
        this.emailSubject = subject;

        return this;
    }

    async process(): Promise<any> {
        this.validate();

        const options: SendMailOptions = {
            from: this.emailFrom,
            to: this.emailTo,
            subject: this.emailSubject,
            text: this.emailTextMessage,
            html: this.emailHtmlMessage,
        };

        return await this.nodemailer.sendMail(options);
    }

    private validate(): void {
        if (!this.emailFrom) {
            throw new Error('Before process, call From() to set missing the sender email');
        }

        if (!this.emailTo) {
            throw new Error('Before process, call To() to set missing receiver email');
        }

        if (!this.emailSubject) {
            throw new Error('Before process, call Subject() to set missing subject');
        }

        if (!this.emailHtmlMessage || !this.emailTextMessage) {
            throw new Error('You need start message calling send() method');
        }
    }

    private reset(): void {
        this.emailFrom = null;
        this.emailTo = null;
        this.emailSubject = null;
        this.emailHtmlMessage = null;
        this.emailTextMessage = null;
    }
}
