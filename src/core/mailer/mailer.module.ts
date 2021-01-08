import { NodemailerDrivers, NodemailerModule, NodemailerOptions } from '@crowdlinker/nestjs-mailer';
import { Module } from '@nestjs/common';

import config from '../configuration/config';
import { MailerService } from './mailer.service';

@Module({
    imports: [
        NodemailerModule.forRoot({
            transport: {
                host: config.getAsString('SMTP_HOST'),
                port: config.getAsNumber('SMTP_PORT'),
                auth: {
                    user: config.getAsString('SMTP_USER'),
                    pass: config.getAsString('SMTP_PASSWORD'),
                },
            },
            defaults: {
                from: `"${config.getAsString('APPLICATION_NAME')}" <${config.getAsString('APPLICATION_EMAIL')}>`,
            },
        } as NodemailerOptions<NodemailerDrivers.SMTP>),
    ],
    providers: [
        MailerService,
    ],
    exports: [
        MailerService,
    ],
})
export class MailerModule { }
