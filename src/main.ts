import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createNamespace } from 'node-request-context';

import { AppModule } from './app.module';
import { ErrorFilter } from './core/common/exceptions/error.filter';
import { setExtensions } from './core/common/utils/extensions';
import config from './core/configuration/config';

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);

createNamespace(config.getAsString('APP_PREFIX'));

// Set native object extensions
setExtensions();

async function bootstrap() {
  // start application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: config.getAsBoolean('APP_LOGGER'),
    }),
  );

  // Logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Cors
  app.enableCors();

  // Helmet
  app.use(helmet());

  // Set prefix to api endpoint
  app.setGlobalPrefix(config.get('APP_PREFIX'));

  // Configure Swagger
  const options = new DocumentBuilder()
    .setTitle('PSW Collector Services')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // Pipes
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors) => new BadRequestException(errors),
  }));

  // Filters
  app.useGlobalFilters(new ErrorFilter());

  // Listen
  await app.listen(config.getAsNumber('APP_PORT'));
}
bootstrap();
