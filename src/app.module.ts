import { HttpModule as NestHttpModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { format } from 'logform';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AuthInternalStrategy } from './core/authorization/auth-internal.strategy';
import { AuthModule } from './core/authorization/auth.module';
import { AuthStrategy } from './core/authorization/auth.strategy';
import { RolesGuard } from './core/authorization/guards/roles.guard';
import config from './core/configuration/config';
import { OrmConfig } from './core/configuration/orm.config';
import { Context } from './core/context/context';
import { ContextMiddleware } from './core/context/context.middleware';
import { JobModule } from './core/job/job.module';
import { MailerModule } from './core/mailer/mailer.module';
import { GeneralModule } from './modules/general/general.module';

const licenseFormatter = format((info, opts) => {
  const licenseId = Context.license();
  const userId = Context.user();
  info.context += ` - [ License: ${licenseId}, User: ${userId}]`;
  return info;
});

@Module({
  imports: [
    GeneralModule,

    JobModule,
    MailerModule,
    AuthModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    SequelizeModule.forRoot(
      OrmConfig.getDefaultSequelizeOrmConfig(),
    ),
    NestHttpModule.register({
      timeout: config.getAsNumber('HTTP_TIMEOUT'),
      maxRedirects: config.getAsNumber('HTTP_MAX_REDIRECTS'),
    }),
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          level: 'error',
          filename: config.getAsString('APP_ERROR_LOG_FILE'),
          format: winston.format.combine(
            winston.format.timestamp(),
            licenseFormatter(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new winston.transports.File({
          level: 'warn',
          filename: config.getAsString('APP_WARN_LOG_FILE'),
          format: winston.format.combine(
            winston.format.timestamp(),
            licenseFormatter(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
      ],
    }),
  ],
  providers: [
    AuthStrategy,
    AuthInternalStrategy,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ContextMiddleware)
      .forRoutes('(.*)');
  }
}
