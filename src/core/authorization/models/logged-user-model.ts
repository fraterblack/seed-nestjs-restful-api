import { v4 } from 'uuid/interfaces';

export class LoggedUser {
    id: v4;
    licenseId?: v4;
    name?: string;
    email?: string;
    roles: string[];
    iat: number;
    exp: number;

    constructor(partial?: Partial<LoggedUser>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }

    isSuper(): boolean {
        return this.hasHole('super');
    }

    hasHole(hole: string): boolean {
        return this.roles.includes(hole);
    }
}
