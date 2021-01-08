import { Model } from 'sequelize';
import { v4 } from 'uuid/interfaces';

import { BaseRepository } from './base-repository';

/**
 * Repository for pivot tables in ManytoMany relationships
 *
 * @export
 * @abstract
 * @class PivotableRepository
 * @extends {BaseRepository<T>}
 * @template T Pivot model used to join target and related
 * @template A Related model
 */
export abstract class PivotableRepository<T extends Model, A> extends BaseRepository<T> {
    abstract targetForeignKey: string;
    abstract relatedForeignKey: string;

    // tslint:disable-next-line: callable-types
    constructor(protected readonly model: { new(): T } & typeof Model) {
        super(model);
    }

    /**
     * Attach related to target model
     *
     * @param {string} targetId
     * @param {A[]} toAttach
     * @returns {Promise<void>}
     */
    async attach(targetId: v4, toAttach: A[] = []): Promise<void> {
        if (!toAttach) {
            return;
        }

        for (const item of toAttach) {
            const pivotModel = {} as T;
            pivotModel[this.targetForeignKey] = targetId;
            // tslint:disable-next-line: no-string-literal
            pivotModel[this.relatedForeignKey] = item['id'];

            await this.create(pivotModel);
        }
    }

    /**
     * Detach related model from target model
     *
     * @param {v4} targetId
     * @param {A[]} toDetach
     * @returns {Promise<void>}
     */
    async detach(targetId: v4, toDetach: A[] = []): Promise<void> {
        for (const item of toDetach) {
            const whereCondition = {
                where: {
                    [this.targetForeignKey]: targetId,
                    // tslint:disable-next-line: no-string-literal
                    [this.relatedForeignKey]: item['id'],
                },
            };

            await this.model.destroy(whereCondition);
        }
    }

    /**
     * Syncronize models in the target
     *
     * @param {v4} targetId
     * @param {A[]} currentAttached
     * @param {A[]} expectedAttachments
     * @returns {Promise<void>}
     */
    async sync(targetId: v4, currentAttached: A[] = [], expectedAttachments: A[] = []): Promise<void> {
        // Filter to not include null id items
        // tslint:disable-next-line: no-string-literal
        currentAttached = (currentAttached || []).filter(x => x['id']);
        // tslint:disable-next-line: no-string-literal
        expectedAttachments = (expectedAttachments || []).filter(x => x['id']);

        // Contains in the current and not in the expected
        const toDetach = currentAttached.filter(model => {
            // tslint:disable-next-line: no-string-literal
            return !expectedAttachments.some(i => model['id'] === i['id']);
        });

        await this.detach(targetId, toDetach);

        // Contains in the expected and not in the current
        const toAttach = expectedAttachments.filter(model => {
            // tslint:disable-next-line: no-string-literal
            return !currentAttached.some(i => model['id'] === i['id']);
        });

        await this.attach(targetId, toAttach);
    }
}
