import { HttpService, Injectable } from '@nestjs/common';

import { Context } from './../context/context';

/**
 * Wrapper to Http request into application
 */
@Injectable()
export class HttpWrapperService {
    constructor(private httpService: HttpService) { }

    /**
     * Get a HttpService instance with context (Authorization) setted
     */
    useContext(): HttpService {
        this.setAuthorization();

        return this.httpService;
    }

    /**
     * Get a HttpService instance without context (Authorization) setted
     */
    use(): HttpService {
        this.unsetAuthotization();

        return this.httpService;
    }

    private setAuthorization() {
        const context = Context.getData();

        // Set token before continues
        this.httpService.axiosRef.defaults.headers.authorization = context.authorization;
    }

    private unsetAuthotization() {
        delete this.httpService.axiosRef.defaults.headers.authorization;
    }
}
