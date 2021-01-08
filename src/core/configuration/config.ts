import { DotenvParseOutput } from 'dotenv';
import * as dotenv from 'dotenv';

const result = dotenv.config({
    path: process.env.APP_ENV === 'test' ? '.env.testing' : '.env',
});

if (result.error) {
    throw result.error;
}

export enum Environment {
    Dev = 'dev',
    Test = 'test',
    Prod = 'prod',
}

export class Config {
    private envs: DotenvParseOutput;

    constructor() {
        const { parsed: envs } = result;
        this.envs = envs as DotenvParseOutput;
    }

    get(attribute: string): string {
        return this.envs[attribute];
    }

    getAsString(attribute: string, alternative?: string): string {
        return this.get(attribute) || alternative;
    }

    getAsBoolean(attribute: string, alternative?: string): boolean {
        return JSON.parse(this.get(attribute) || alternative || '0');
    }

    getAsNumber(attribute: string, alternative?: number): number {
        return this.get(attribute) ? Number(this.get(attribute)) : alternative;
    }

    all(): DotenvParseOutput {
        return this.envs;
    }

    environment(): Environment {
        switch (this.get('APP_ENV')) {
            case Environment.Test:
                return Environment.Test;

            case Environment.Prod:
                return Environment.Prod;

            case Environment.Dev:
            default:
                return Environment.Dev;
        }
    }
}

export default new Config();
