import { v4 } from 'uuid/interfaces';

export class ContextData {
    authorization: string;
    userId: v4;
    licenseId: v4;

    constructor(partial?: Partial<ContextData>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
