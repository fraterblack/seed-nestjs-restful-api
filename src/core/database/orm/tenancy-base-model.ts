import { Op } from 'sequelize';
import {
    BeforeBulkDestroy,
    BeforeBulkUpdate,
    BeforeCount,
    BeforeFind,
    BeforeFindAfterExpandIncludeAll,
    BeforeSave,
    BeforeUpdate,
    BeforeUpsert,
    BeforeValidate,
} from 'sequelize-typescript';

import { Context } from '../../context/context';
import { BaseModel } from './base-model';

export abstract class TenancyBaseModel<T> extends BaseModel<T> {
    /**
     * Skip tenancy for save operations
     */
    protected static skipTenancyForSave = false;

    /**
     * Skip tenancy for update operations
     */
    protected static skipTenancyForUpdate = false;

    /**
     * Set if update tenant hook could be optional
     * Pay attention by using this attribute
     */
    protected static tenancyForUpdateIsOptional = false;

    /**
     * Skip tenancy for destroy operations
     */
    protected static skipTenancyForDestroy = false;

    /**
     * Skip tenancy for find operations
     */
    protected static skipTenancyForFind = false;

    /**
     * Set if find tenant hook could be optional
     * Pay attention by using this attribute
     */
    protected static tenancyForFindIsOptional = false;

    // Tenancy
    @BeforeValidate
    @BeforeSave
    static beforeSaveHook(instance: any): void {
        if (!this.skipTenancyForSave) {
            instance.licenseId = Context.license();
        }
    }

    @BeforeUpsert
    @BeforeUpdate
    static beforeUpdateHook(instance: any, options: any): void {
        if (!this.skipTenancyForUpdate) {
            if (Context.getData()) {
                options.where[Op.and][0].licenseId = Context.license();
            } else {
                if (!this.tenancyForUpdateIsOptional) {
                    throw new Error('Could not set tenantId for update hook');
                }
            }
        }
    }

    @BeforeBulkUpdate
    static beforeBulkUpdateHook(options: any): void {
        options.individualHooks = true;
    }

    @BeforeBulkDestroy
    static beforeBulkDestroyHook(options: any): void {
        options.individualHooks = true;

        if (!this.skipTenancyForDestroy) {
            options.where.licenseId = Context.license();
        }
    }

    @BeforeCount
    @BeforeFind
    @BeforeFindAfterExpandIncludeAll
    static beforeFindAfterExpandIncludeAllHook(options: any): void {
        if (!this.skipTenancyForFind) {
            if (Context.getData()) {
                options.where = options.where || {};
                options.where.licenseId = Context.license();
            } else {
                if (!this.tenancyForFindIsOptional) {
                    throw new Error('Could not set tenantId for find hook');
                }
            }
        }
    }
}
