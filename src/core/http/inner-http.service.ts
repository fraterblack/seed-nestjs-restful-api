import { HttpService, Injectable } from '@nestjs/common';
import { cloneDeep } from 'lodash';

/**
 * Wrapper to  Http service
 */
@Injectable()
export class InnerHttpService {
    constructor(
        private readonly httpService: HttpService,
    ) { }

    /**
     * Get a HttpService instance without context (Authorization) setted
     */
    use(): HttpService {
        return this.httpService;
    }

    /**
     * Get a HttpService instance with given token setted to (Authorization)
     */
    withToken(token: string): HttpService {
        const clonedService = cloneDeep(this.httpService);

        if (!clonedService.axiosRef) {
            throw new Error('axiosRef is undefined');
        }

        clonedService.axiosRef.defaults.headers.authorization = `Bearer ${token}`;

        return clonedService;
    }
}
