import { SequelizeModuleOptions } from '@nestjs/sequelize';

import config, { Environment } from './config';

export class OrmConfig {
    static getDefaultSequelizeOrmConfig(): SequelizeModuleOptions {
        return {
            dialect: 'postgres',

            host: config.get('POSTGRES_HOST'),
            port: config.getAsNumber('POSTGRES_PORT'),
            username: config.get('POSTGRES_USER'),
            password: config.get('POSTGRES_PASSWORD'),
            database: config.get('POSTGRES_DATABASE'),
            // tslint:disable-next-line: no-console
            logging: config.getAsBoolean('ORM_DEBUG') ? console.log : false,
            ssl: OrmConfig.isProduction(),
            models: [
                __dirname + '/../../modules/**/*.model{.ts,.js}',
            ],
            modelMatch: (filename, member) => {
                const sanitizedFilename = filename.replace(/-/g, '');
                const modelStripped = sanitizedFilename.substring(0, sanitizedFilename.indexOf('.model'));

                return modelStripped === member.toLowerCase();
            },
        };
    }

    private static isProduction(): boolean {
        return config.environment() === Environment.Prod;
    }
}
