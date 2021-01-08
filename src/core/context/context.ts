import { getNamespace } from 'node-request-context';
import { v4 } from 'uuid/interfaces';

import config from '../configuration/config';
import { ContextData } from './context-data';

export class Context {
    public static setData(context: ContextData): void {
        const namespace = getNamespace(config.getAsString('APP_PREFIX'));

        namespace.run(() => {
            namespace.set('context', context);
        });
    }

    public static getData(): ContextData {
        try {
            const namespace = getNamespace(config.getAsString('APP_PREFIX'));

            if (!namespace) {
                return null;
            }

            const rc = namespace.get('context');

            if (!rc) {
                throw new Error('Context namespace is undefined');
            }

            return rc;
            // tslint:disable-next-line: no-empty
        } catch (err) { }

        return null;
    }

    public static user(): v4 {
        const context = Context.getData();
        return context?.userId;
    }

    public static license(): v4 {
        const context = Context.getData();
        return context?.licenseId;
    }
}
