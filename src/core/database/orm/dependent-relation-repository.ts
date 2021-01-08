import { Model } from 'sequelize';
import { v4 } from 'uuid/interfaces';

import { BaseRepository } from './base-repository';

/**
 * Repository for dependent models (Simple models that have not a service API to persist data)
 *
 * @export
 * @abstract
 * @class DependentRelationRepository
 * @extends {BaseRepository<T>}
 * @template T Related model nested to a targer model
 */
export abstract class DependentRelationRepository<T extends Model> extends BaseRepository<T> {
    abstract relatedForeignKey: string;

    // tslint:disable-next-line: callable-types
    constructor(protected readonly model: { new(): T } & typeof Model) {
        super(model);
    }

    /**
     * Create children models nested to target
     *
     * @param {v4} targetId
     * @param {T[]} [toAdd=[]]
     * @returns {Promise<T[]>}
     * @memberof DependentRelationRepository
     */
    async createChildren(targetId: v4, toAdd: T[] = []): Promise<T[]> {
        if (!toAdd) {
            return null;
        }

        toAdd = toAdd.map(i => {
            i[this.relatedForeignKey] = targetId;

            // tslint:disable-next-line: no-string-literal
            delete i['id'];

            return i;
        });

        return await this.createMany(toAdd);
    }

    /**
     * Update nested models
     *
     * @param {T[]} [toUpdate=[]]
     * @returns {Promise<T[]>}
     * @memberof DependentRelationRepository
     */
    async updateChildren(toUpdate: T[] = []): Promise<T[]> {
        if (!toUpdate) {
            return null;
        }

        return await this.updateMany(toUpdate);
    }

    /**
     * Delete nested models of target
     *
     * @param {T[]} [toDelete=[]]
     * @returns {Promise<number>}
     * @memberof DependentRelationRepository
     */
    async deleteChildren(toDelete: T[] = []): Promise<number> {
        if (!toDelete) {
            return null;
        }

        return await this.deleteMany(toDelete);
    }

    /**
     * Based on current and expected sync nested models of target
     *
     * @param {v4} targetId
     * @param {T[]} [currentChildren=[]]
     * @param {T[]} [expectedChildren=[]]
     * @returns {Promise<T[]>}
     * @memberof DependentRelationRepository
     */
    async asyncChildren(targetId: v4, currentChildren: T[] = [], expectedChildren: T[] = []): Promise<T[]> {
        // DELETE
        // Contains in the current and not in the expected
        const toDelete = currentChildren.filter(x => {
            // tslint:disable-next-line: no-string-literal
            return !expectedChildren.some(i => x['id'] === i['id']);
        });

        await this.deleteChildren(toDelete);

        // ADD
        // Contains in the expectedd and not in the current
        const toCreate = expectedChildren.filter(x => {
            // tslint:disable-next-line: no-string-literal
            return !currentChildren.some(i => x['id'] !== null && x['id'] === i['id']);
        });

        const addedDiscounts = await this.createChildren(targetId, toCreate);

        // UPDATE
        // All in current without items to delete
        const toUpdate = expectedChildren.filter(x => {
            // tslint:disable-next-line: no-string-literal
            if (!x['id']) {
                return false;
            }

            // tslint:disable-next-line: no-string-literal
            return !toDelete.some(i => x['id'] === i['id']);
        });

        const updatedDiscounts = await this.updateChildren(toUpdate);

        return [...addedDiscounts, ...updatedDiscounts];
    }
}
