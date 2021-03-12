import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AuthInternalWithLicenseStrategy } from './core/authorization/auth-internal-with-license.strategy';
import { AuthInternalStrategy } from './core/authorization/auth-internal.strategy';
import { AuthModule } from './core/authorization/auth.module';
import { AuthStrategy } from './core/authorization/auth.strategy';
import { RolesGuard } from './core/authorization/guards/roles.guard';
import config from './core/configuration/config';
import { OrmConfig } from './core/configuration/orm.config';
import { ContextMiddleware } from './core/context/context.middleware';
import { ContextModule } from './core/context/context.module';
import { MailerModule } from './core/mailer/mailer.module';
import { QueueModule } from './core/queue/queue.module';
import { GeneralModule } from './modules/general/general.module';
import { GroupModule } from './modules/group/group.module';

@Module({
  imports: [
    GeneralModule,
    GroupModule,

    ContextModule,
    QueueModule,
    MailerModule,
    AuthModule,
    PassportModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({}),
    SequelizeModule.forRoot(
      OrmConfig.getDefaultSequelizeOrmConfig(),
    ),
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [
        new winston.transports.File({
          level: 'error',
          filename: config.getAsString('APP_ERROR_LOG_FILE'),
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new winston.transports.File({
          level: 'warn',
          filename: config.getAsString('APP_WARN_LOG_FILE'),
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
      ],
    }),
  ],
  providers: [
    AuthStrategy,
    AuthInternalStrategy,
    AuthInternalWithLicenseStrategy,
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
