import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { v4 } from 'uuid/interfaces';

import { ContextData } from './context-data';

@Injectable({ scope: Scope.REQUEST })
export class ContextService {
    private context: ContextData;

    constructor(@Inject(REQUEST) private readonly request: any) { }

    setData(data: ContextData): ContextData {
        this.context = data;

        return this.context;
    }

    getData(): ContextData {
        return this.context;
    }

    user(): v4 {
        const context = this.getData();
        return context?.userId;
    }

    license(): v4 {
        const context = this.getData();
        return context?.licenseId;
    }

    requestId() {
        return this.request.id;
    }
}
