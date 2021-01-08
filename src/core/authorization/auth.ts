import * as bcrypt from 'bcrypt';

import config from '../configuration/config';

export class Auth {
    static transformPassword(password: string): string {
        return bcrypt.hashSync(password, config.getAsNumber('AUTH_SALT_ROUNDS'));
    }

    static compare(password: string, encryptedPassword: string): boolean {
        return bcrypt.compareSync(password, encryptedPassword);
    }
}
