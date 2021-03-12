import { Model } from 'sequelize';
import { v4 } from 'uuid/interfaces';

import { ContextService } from '../../context/context.service';
import { TenancyRepository } from './tenancy-repository';

/**
 * Repository for pivot tables in ManytoMany relationships
 *
 * @export
 * @abstract
 * @class PivotableRepository
 * @extends {TenancyRepository<T>}
 * @template T Pivot model used to join target and related
 * @template A Related model
 */
export abstract class PivotableRepository<T extends Model, A> extends TenancyRepository<T> {
    protected abstract targetForeignKey: string;
    protected abstract relatedForeignKey: string;

    constructor(
        protected readonly model: (new () => T) & typeof Model,
        protected readonly contextService: ContextService,
    ) {
        super(model, contextService);
    }

    /**
     * Attach related to target model
     *
     * @param {string} targetId
     * @param {A[]} toAttach
     * @param {string} identifier
     * @returns {Promise<void>}
     */
    async attach(targetId: v4, toAttach: A[] = [], identifier = 'id'): Promise<void> {
        if (!toAttach) {
            return;
        }

        for (const item of toAttach) {
            const pivotModel = {} as T;
            pivotModel[this.targetForeignKey] = targetId;
            // tslint:disable-next-line: no-string-literal
            pivotModel[this.relatedForeignKey] = item[identifier];

            await this.create(pivotModel);
        }
    }

    /**
     * Detach related model from target model
     *
     * @param {v4} targetId
     * @param {A[]} toDetach
     * @param {string} identifier
     * @returns {Promise<void>}
     */
    async detach(targetId: v4, toDetach: A[] = [], identifier = 'id'): Promise<void> {
        for (const item of toDetach) {
            const whereCondition = {
                where: {
                    [this.targetForeignKey]: targetId,
                    // tslint:disable-next-line: no-string-literal
                    [this.relatedForeignKey]: item[identifier],
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
     * @param {string} currentIdentifier
     * @param {string} expectedIdentifier
     * @returns {Promise<void>}
     */
    async sync(
        targetId: v4,
        currentAttached: A[] = [],
        expectedAttachments: A[] = [],
        currentIdentifier = 'id',
        expectedIdentifier = 'id',
    ): Promise<void> {
        // Filter to not include null id items
        // tslint:disable-next-line: no-string-literal
        currentAttached = (currentAttached || []).filter(x => x[currentIdentifier]);
        // tslint:disable-next-line: no-string-literal
        expectedAttachments = (expectedAttachments || []).filter(x => x[expectedIdentifier]);

        // Contains in the current and not in the expected
        const toDetach = currentAttached.filter(model => {
            // tslint:disable-next-line: no-string-literal
            return !expectedAttachments.some(i => model[currentIdentifier] === i[expectedIdentifier]);
        });

        await this.detach(targetId, toDetach, currentIdentifier);

        // Contains in the expected and not in the current
        const toAttach = expectedAttachments.filter(model => {
            // tslint:disable-next-line: no-string-literal
            return !currentAttached.some(i => model[expectedIdentifier] === i[currentIdentifier]);
        });

        await this.attach(targetId, toAttach, expectedIdentifier);
    }
}
