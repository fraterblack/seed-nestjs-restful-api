import { Injectable, Scope } from '@nestjs/common';
import { Model, Op } from 'sequelize';

import { ContextService } from '../../context/context.service';
import { BaseRepository } from './base-repository';
import { CreateOptions, ScopeOptions, UpdateOptions } from './orm-wrapper';

@Injectable({
    scope: Scope.REQUEST,
})
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
        // tslint:disable-next-line: callable-types
        protected readonly model: { new(): T } & typeof Model,
        protected readonly contextService: ContextService,
    ) {
        super(model);
    }

    /**
     * @override
     */
    protected setupFetchScope(model: typeof Model): void {
        this.setupTenancyScope(model);
    }

    /**
     * @override
     */
    protected setupUpdateScope(model: typeof Model): void {
        this.setupTenancyScope(model);
    }

    /**
     * @override
     */
    protected setupDeleteScope(model: typeof Model): void {
        this.setupTenancyScope(model);
    }

    /**
     * @override
     */
    protected fetchScope(): ScopeOptions {
        if (!this.skipTenancyForFind) {
            if (this.contextService.getData()) {
                return this.getTenancyScope();
            } else {
                if (!this.tenancyForFindIsOptional) {
                    throw new Error('Could not set tenantId for fetch scope');
                }
            }
        }

        return null;
    }

    /**
     * @override
     */
    protected updateScope(): ScopeOptions {
        if (!this.skipTenancyForUpdate) {
            if (this.contextService.getData()) {
                return this.getTenancyScope();
            } else {
                if (!this.tenancyForUpdateIsOptional) {
                    throw new Error('Could not set tenantId for update scope');
                }
            }
        }

        return null;
    }

    /**
     * @override
     */
    protected deleteScope(): ScopeOptions {
        if (!this.skipTenancyForDestroy) {
            if (this.contextService.getData()) {
                return this.getTenancyScope();
            } else {
                throw new Error('Could not set tenantId for delete scope');
            }
        }

        return null;
    }

    /**
     * @override
     */
    protected beforeCreateModel(model: any, options?: CreateOptions): any {
        this.setTenancyAttributeToCreateModel(model);

        return model;
    }

    /**
     * @override
     */
    protected beforeUpdateModel(model: any, options?: UpdateOptions): any {
        model = this.setTenancyAttributeToUpdateModel(model);

        return model;
    }

    //#region Private methods

    private setupTenancyScope(model: typeof Model) {
        model.addScope('tenancy', (licenseId: string) => {
            return {
                where: {
                    [Op.and]: { licenseId },
                },
            };
        }, { override: true });
    }

    private getTenancyScope(): ScopeOptions {
        return { method: ['tenancy', this.contextService.license().toString()] };
    }

    private setTenancyAttributeToCreateModel(model: any): void {
        if (!this.skipTenancyForSave) {
            if (this.contextService.getData()) {
                model.license = { id: this.contextService.license() };
            } else {
                throw new Error('Could not set tenantId on create model');
            }
        }
    }

    private setTenancyAttributeToUpdateModel(model: any): T {
        if (!this.skipTenancyForUpdate) {
            model.license = { id: this.contextService.license() };
        }

        return model;
    }

    //#endregion
}
