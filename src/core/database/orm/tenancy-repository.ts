import { Model, Op } from 'sequelize';

import { ContextService } from '../../context/context.service';
import { BaseRepository } from './base-repository';

export abstract class TenancyRepository<T extends Model> extends BaseRepository<T> {
    /**
     * Skip tenancy for save operations
     */
    protected skipTenancyForSave = false;

    /**
     * Skip tenancy for update operations
     */
    protected skipTenancyForUpdate = false;

    /**
     * Skip tenancy for destroy operations
     */
    protected skipTenancyForDestroy = false;

    /**
     * Skip tenancy for find operations
     */
    protected skipTenancyForFind = false;

    /**
     * Set if update tenant hook could be optional
     * Pay attention by using this attribute
     */
    protected tenancyForUpdateIsOptional = false;

    /**
     * Set if update tenant hook could be optional
     * Pay attention by using this attribute
     */
    protected tenancyForFindIsOptional = false;

    constructor(
        protected readonly model: (new () => T) & typeof Model,
        protected readonly contextService: ContextService,
    ) {
        super(model);

        // BeforeValidate
        // BeforeSave
        const beforeSaveHook = (instance: any) => {
            if (!this.skipTenancyForSave) {
                instance.licenseId = this.contextService.license();
            }
        };
        model.addHook('beforeValidate', beforeSaveHook);
        model.addHook('beforeSave', beforeSaveHook);

        // BeforeBulkCreate
        const beforeBulkCreateHook = (models: any[]) => {
            if (!this.skipTenancyForSave) {
                models.map(x => x.licenseId = this.contextService.license());
            }
        };
        model.addHook('beforeBulkCreate', beforeBulkCreateHook);

        // BeforeUpdate
        const beforeUpdateHook = (instance: any, options: any) => {
            if (!this.skipTenancyForUpdate) {
                if (this.contextService.getData()) {
                    options.where[Op.and][0].licenseId = this.contextService.license();
                } else {
                    if (!this.tenancyForUpdateIsOptional) {
                        throw new Error('Could not set tenantId for update hook');
                    }
                }
            }
        };
        model.addHook('beforeUpdate', beforeUpdateHook);
        // model.addHook('beforeUpsert', beforeUpdateHook);

        // BeforeBulkUpdate
        const beforeBulkUpdateHook = (options: any) => {
            options.individualHooks = true;

            /**
             * This is a workaround to force setting foreign key of nullable relation to null on update
             * Currently old foreign key is setted on upda a record setting null to foreignKey
             */
            if (options.attributes && this.nullableRelations && this.nullableRelations.length) {
                this.nullableRelations.forEach(i => {
                    if (!options.attributes[i]) {
                        options.attributes[i] = null;
                    }
                });
            }
        };
        model.addHook('beforeBulkUpdate', beforeBulkUpdateHook);

        // BeforeBulkDestroy
        const beforeBulkDestroyHook = (options: any) => {
            options.individualHooks = true;

            if (!this.skipTenancyForDestroy) {
                options.where.licenseId = this.contextService.license();
            }
        };
        model.addHook('beforeBulkDestroy', beforeBulkDestroyHook);

        // BeforeFindAfterExpandIncludeAll
        // BeforeFind
        // BeforeCount
        const beforeFindAfterExpandIncludeAllHook = (options: any) => {
            if (!this.skipTenancyForFind) {
                if (this.contextService.getData()) {
                    options.where = options.where || {};
                    options.where.licenseId = this.contextService.license();
                } else {
                    if (!this.tenancyForFindIsOptional) {
                        throw new Error('Could not set tenantId for find hook');
                    }
                }
            }
        };
        model.addHook('beforeFindAfterExpandIncludeAll', beforeFindAfterExpandIncludeAllHook);
        model.addHook('beforeFind', beforeFindAfterExpandIncludeAllHook);
        model.addHook('beforeCount', beforeFindAfterExpandIncludeAllHook);
    }
}
