import { BuildOptions, DataTypes } from 'sequelize';
import { AutoIncrement, Column, DeletedAt, Model } from 'sequelize-typescript';
import { v4 } from 'uuid/interfaces';

export abstract class BaseModel<T> extends Model<T> {
    @AutoIncrement
    @Column({ type: DataTypes.UUID, primaryKey: true })
    id: v4;

    @DeletedAt
    deletedAt: Date;

    constructor(partial?: object, options?: BuildOptions) {
        // Try to parse foreign key id to object
        for (const key in partial) {
            if (partial.hasOwnProperty(key)) {
                if (typeof partial[key] === 'object') {
                    // tslint:disable-next-line: no-string-literal
                    if (partial[key] && partial[key]['id']) {
                        // tslint:disable-next-line: no-string-literal
                        partial[`${key}Id`] = partial[key]['id'];
                    }
                }
            }
        }

        super(partial, options);

        Object.assign(this, partial);
    }

    copyInto(model: Model<T>, clearId: boolean): this {
        try {
            const data = model.get();

            if (clearId) {
                // tslint:disable-next-line: no-string-literal
                data['id'] = null;
            }

            Object.assign(this, this.deepCopy(data));
        } catch (error) {
            throw new Error('Error on copy model into');
        }

        return this;
    }

    private deepCopy(obj: object): object {
        const data = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (value && value instanceof Array) {
                    data[key] = value.map(x => this.deepCopy(x));

                    // tslint:disable-next-line: no-string-literal
                } else if (value && value['dataValues']) {
                    data[key] = this.deepCopy(value.get());
                } else {
                    data[key] = value;
                }
            }
        }

        return data;
    }
}
