import { isArray } from 'lodash';
import sequelize, { FindAndCountOptions, Model, Op, Order, Sequelize, WhereAttributeHash } from 'sequelize';
import { Where } from 'sequelize/types/lib/utils';

import { IInclude } from '../query/interfaces/include.interface';
import { FindOptions } from './../query/find-options';
import { IQueryFilter } from './../query/interfaces/query-filter.interface';
import { ISelectGroup } from './../query/interfaces/select-group.interface';
import { QueryOptions } from './../query/query-options';
import { EntityNotFoundError } from './exceptions/entity-not-found.error';
import { IRelations } from './interfaces/relations.interface';
import {
    DestroyOptions,
    FindOptions as OrmFindOptions,
    Identifier,
    Includeable,
    UpdateOptions,
    WhereOptions,
} from './orm-wrapper';

export abstract class BaseRepository<T extends Model> {
    protected relations: IRelations = {};

    protected defaultOrder: string[][] = [];

    // tslint:disable-next-line: callable-types
    constructor(protected readonly model: { new(): T } & typeof Model) { }

    //#region Create
    /**
     * Create model
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async create(model: T): Promise<T> {
        model = await this.beforeCreate(model);

        const newModel = await this.model.sequelize.transaction(async t => {
            const transactionHost = { transaction: t };

            const newModelToCommit = await this.model.create<T>(model, transactionHost);

            return this.afterCreate(newModelToCommit);
        });

        return this.afterCreateCommit(newModel);
    }

    /**
     * Execute some action before create model
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async beforeCreate(model: T): Promise<T> {
        return model;
    }

    /**
     * Execute some action after create model
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async afterCreate(model: T): Promise<T> {
        return model;
    }

    /**
     * Execute some action after create commit model
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async afterCreateCommit(model: T): Promise<T> {
        return model;
    }

    //#endregion

    //#region Create Many

    async createMany(models: T[] = []): Promise<T[]> {
        models = await this.beforeCreateMany(models);

        const newModels: T[] = [];

        await this.model.sequelize.transaction(async t => {
            const transactionHost = { transaction: t };

            for (const model of models) {
                const newModel = await this.model.create<T>(model, transactionHost);
                newModels.push(newModel);
            }
        });

        return this.afterCreateMany(newModels);
    }

    /**
     * Execute some action before create many models
     *
     * @param {T[]} models
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async beforeCreateMany(models: T[]): Promise<T[]> {
        return models;
    }

    /**
     * Execute some action after create many models
     *
     * @param {T[]} models
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async afterCreateMany(models: T[]): Promise<T[]> {
        return models;
    }

    //#endregion

    //#region Update

    /**
     * Update model
     *
     * @param {T} model
     * @param {UpdateOptions} [options]
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async update(model: T, options?: UpdateOptions): Promise<T> {
        model = await this.beforeUpdate(model, options);

        // tslint:disable-next-line: no-string-literal
        if (!model['id']) {
            throw new EntityNotFoundError(this.model.tableName, 'Undefined identifier');
        }

        // tslint:disable-next-line: no-string-literal
        const identifier = model['id'].toString();

        // Ensure a where condition exists
        if (options && (!options.where || !Object.keys(options.where).length)) {
            options.where = { id: identifier };
        }

        const updateOptions: UpdateOptions = options ? options : { where: { id: identifier } };

        const updatedModel = await this.model.sequelize.transaction(async t => {
            updateOptions.transaction = t;

            await this.model.update<T>(model, updateOptions);

            const currentModel = await this.model.findByPk<T>(identifier);

            if (!currentModel) {
                throw new EntityNotFoundError(this.model.tableName, identifier);
            }

            return this.afterUpdate(Object.assign(currentModel, model));
        });

        return this.afterUpdateCommit(updatedModel);
    }

    /**
     * Execute some action before execute update action
     *
     * @param {T} model
     * @param {UpdateOptions} [options]
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async beforeUpdate(model: T, options?: UpdateOptions): Promise<T> {
        return model;
    }

    /**
     * Execute some action after update model
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async afterUpdate(model: T): Promise<T> {
        return model;
    }

    /**
     * Execute some action after update commit
     *
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async afterUpdateCommit(model: T): Promise<T> {
        return model;
    }

    //#endregion

    //#region Update Many

    /**
     * Update model
     *
     * @param {T[]} models
     * @param {UpdateOptions} [options]
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async updateMany(models: T[], options?: UpdateOptions): Promise<T[]> {
        models = await this.beforeUpdateMany(models, options);

        const updatedModels: T[] = [];

        await this.model.sequelize.transaction(async t => {
            for (const model of models) {
                // tslint:disable-next-line: no-string-literal
                if (!model['id']) {
                    throw new EntityNotFoundError(this.model.tableName, 'Undefined identifier');
                }

                // tslint:disable-next-line: no-string-literal
                const identifier = model['id'].toString();

                if (!identifier) {
                    continue;
                }

                // Ensure a where condition exists
                if (options && (!options.where || !Object.keys(options.where).length)) {
                    options.where = { id: identifier };
                }

                const updateOptions: UpdateOptions = options ? options : { where: { id: identifier } };

                updateOptions.transaction = t;

                await this.model.update<T>(model, updateOptions);

                const updatedModel = await this.model.findByPk<T>(identifier);

                if (!updatedModel) {
                    throw new EntityNotFoundError(this.model.tableName, identifier);
                }

                updatedModels.push(Object.assign(updatedModel, model));
            }

            return this.afterUpdateMany(updatedModels);
        });

        return this.afterUpdateManyCommit(updatedModels);
    }

    /**
     * Execute some action before execute update many action
     *
     * @param {T[]} models
     * @param {UpdateOptions} [options]
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async beforeUpdateMany(models: T[], options?: UpdateOptions): Promise<T[]> {
        return models;
    }

    /**
     * Execute some action after update many models
     *
     * @param {T[]} models
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async afterUpdateMany(models: T[]): Promise<T[]> {
        return models;
    }

    /**
     * Execute some action after update many commit
     *
     * @param {T[]} models
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async afterUpdateManyCommit(models: T[]): Promise<T[]> {
        return models;
    }

    //#endregion

    //#region Delete

    /**
     * Delete model
     *
     * @param {(T | string)} model
     * @param {DestroyOptions} [options]
     * @returns {Promise<number>}
     * @memberof BaseRepository
     */
    async delete(model: T | string, options?: DestroyOptions): Promise<number> {
        model = await this.beforeDelete(model);

        const identifier = this.getIdentifier(model);

        // Ensure a where condition exists
        if (options && (!options.where || !Object.keys(options.where).length)) {
            options.where = { id: identifier };
        }

        const destroyOptions = options ? options : { where: { id: identifier } };

        const deleteResult = await this.model.sequelize.transaction(async t => {
            destroyOptions.transaction = t;

            const result = await this.model.destroy(destroyOptions);

            if (!result) {
                throw new EntityNotFoundError(this.model.tableName, destroyOptions);
            }

            return this.afterDelete(result);
        });

        return this.afterDeleteCommit(deleteResult);
    }

    /**
     * Execute some action before delete model
     *
     * @param {(T | string)} model
     * @param {DestroyOptions} [options]
     * @returns {(Promise<T | string>)}
     * @memberof BaseRepository
     */
    async beforeDelete(model: T | string, options?: DestroyOptions): Promise<T | string> {
        return model;
    }

    /**
     * Execute some action after delete model
     *
     * @param {number} rows
     * @returns {Promise<number>} Number of destroyed rows
     * @memberof BaseRepository
     */
    async afterDelete(rows: number): Promise<number> {
        return rows;
    }

    /**
     * Execute some action after delete commit
     *
     * @param {number} rows
     * @returns {Promise<number>} Number of destroyed rows
     * @memberof BaseRepository
     */
    async afterDeleteCommit(rows: number): Promise<number> {
        return rows;
    }

    //#endregion

    //#region Delete Many

    /**
     * Delete many models
     *
     * @param {(T[] | string[])} models
     * @param {DestroyOptions} [options]
     * @returns {Promise<number>}
     * @memberof BaseRepository
     */
    async deleteMany(models: T[] | string[], options?: DestroyOptions): Promise<number> {
        models = await this.beforeDeleteMany(models);

        const deleteResult = await this.model.sequelize.transaction(async t => {
            let totalResult = 0;

            for (const model of models) {
                const identifier = this.getIdentifier(model);

                if (!identifier) {
                    continue;
                }

                // Ensure a where condition exists
                if (options && (!options.where || !Object.keys(options.where).length)) {
                    options.where = { id: identifier };
                }

                const destroyOptions = options ? options : { where: { id: identifier } };
                destroyOptions.transaction = t;

                const result = await this.model.destroy(destroyOptions);

                if (!result) {
                    throw new EntityNotFoundError(this.model.tableName, destroyOptions);
                }

                totalResult++;
            }

            return this.afterDeleteMany(totalResult);
        });

        return this.afterDeleteCommit(deleteResult);
    }

    /**
     * Execute some action before delete many models
     *
     * @param {(T[] | string[])} models
     * @param {DestroyOptions} [options]
     * @returns {(Promise<T[] | string[]>)}
     * @memberof BaseRepository
     */
    async beforeDeleteMany(models: T[] | string[], options?: DestroyOptions): Promise<T[] | string[]> {
        return models;
    }

    /**
     * Execute some action after delete model
     *
     * @param {number} rows
     * @returns {Promise<number>} Number of destroyed rows
     * @memberof BaseRepository
     */
    async afterDeleteMany(rows: number): Promise<number> {
        return rows;
    }

    /**
     * Execute some action after delete commit
     *
     * @param {number} rows
     * @returns {Promise<number>} Number of destroyed rows
     * @memberof BaseRepository
     */
    async afterDeleteManyCommit(rows: number): Promise<number> {
        return rows;
    }

    //#endregion

    //#region Fetch

    async findOneOrFail(identifier?: Identifier, options?: Omit<FindOptions, 'where'>, strict = true): Promise<T> {
        const transformedOptions = this.transformQueryOptionsDtoToFindOptions(options);

        const result = await this.model.findByPk<T>(identifier, transformedOptions);

        if (!result) {
            if (strict) {
                throw new EntityNotFoundError(this.model.name, identifier);
            }

            return null;
        }

        return result;
    }

    async findBy(whereCondition: WhereOptions, options?: Omit<FindOptions, 'where'>, strict = true): Promise<T> {
        const transformedOptions = this.transformQueryOptionsDtoToFindOptions(options);

        transformedOptions.where = whereCondition;

        const result = await this.model.findOne<T>(transformedOptions);

        if (!result) {
            if (strict) {
                throw new EntityNotFoundError(this.model.name, whereCondition);
            }

            return null;
        }

        return result;
    }

    async paginatedQuery(options?: QueryOptions): Promise<{ rows: T[]; count: number }> {
        const transformedOptions: FindAndCountOptions = this.transformQueryOptionsDtoToFindOptions(options);

        if (transformedOptions.include && transformedOptions.include.length) {
            transformedOptions.distinct = true;
        }

        return this.model.findAndCountAll<T>(transformedOptions);
    }

    async query(options?: QueryOptions): Promise<T[]> {
        const transformedOptions = this.transformQueryOptionsDtoToFindOptions(options);

        return this.model.findAll<T>(transformedOptions);
    }

    //#endregion

    orm(): Sequelize {
        return this.model.sequelize;
    }

    protected transformQueryOptionsDtoToFindOptions(options: QueryOptions | FindOptions): OrmFindOptions {
        options = options || {};

        const condition: OrmFindOptions = {};

        const { select, include, sort, includeDeleted } = options;

        let where: IQueryFilter[][];
        let page: number;
        let limit: number;

        if (options instanceof QueryOptions) {
            where = options.where;
            page = options.page;
            limit = options.limit;
        }

        const groupedSelect = this.groupSelectCondition(select || null);

        // Select
        if (select && groupedSelect._) {
            condition.attributes = groupedSelect._;
        }

        // Where
        if (where) {
            condition.where = this.transformWhereCondition(where);
        }

        // Include relation
        if (include) {
            condition.include = this.setIncludes(include, groupedSelect);
        }

        // Order
        if (sort) {
            condition.order = [];

            for (const i in sort) {
                if (sort.hasOwnProperty(i)) {
                    /*
                    const part = i.split('.');

                    if (part.length === 1) {
                        condition.order.push([i, sort[i]]);
                    } else {
                        const model = this.relations[part[0]];

                        if (model) {
                            condition.order.push([{ model, as: part[0] }, part[1], sort[i]]);
                        }
                    }
                    */

                    if (i.includes('.')) {
                        condition.order.push([Sequelize.literal(`"${i}"`), sort[i]]);
                    } else {
                        condition.order.push([i, sort[i]]);
                    }
                }
            }
        } else if (this.defaultOrder.length) {
            condition.order = this.defaultOrder as Order;
        }

        // Pagination
        if (limit) {
            condition.limit = limit;
            condition.offset = ((!page || page < 1 ? 1 : page) - 1) * limit;
        }

        condition.paranoid = !includeDeleted;

        return condition;
    }

    protected groupSelectCondition(select: string[]): ISelectGroup {
        if (!select) {
            return {};
        }

        const groups = { _: [] };

        // TODO: Refactor this logic to use recursive functions and accept more than 2 nested levels
        select.forEach(i => {
            const part = i.split('.');

            if (part.length === 1) {
                groups._.push(part[0]);
            } else if (part.length === 2) {
                if (!groups[part[0]]) {
                    groups[part[0]] = [];
                }
                groups[part[0]].push(part[1]);
            } else if (part.length === 3) {
                if (!groups[part[1]]) {
                    groups[part[1]] = [];
                }
                groups[part[1]].push(part[2]);
            } else {
                throw new Error('Column selection is limited in two nested levels');
            }
        });

        return groups;
    }

    protected transformWhereCondition(segments: IQueryFilter[][]): WhereOptions {
        const whereConditions = [];

        segments.forEach(segment => {
            const internalWhere = {};

            segment.forEach((condition: IQueryFilter) => {
                // If has a dot in the column, it is supposed that is a join
                if (condition.col.includes('.')) {
                    condition.col = '$' + condition.col + '$';
                }

                if (internalWhere[condition.col]) {
                    internalWhere[condition.col] = {
                        [Op.and]: {
                            ...internalWhere[condition.col],
                            ...this.getParsedWhereValue(condition.col, condition.op, condition.value),
                        },
                    };
                } else {
                    internalWhere[condition.col] = this.getParsedWhereValue(condition.col, condition.op, condition.value);
                }
            });

            whereConditions.push(internalWhere);
        });

        if (whereConditions.length > 0) {
            return {
                [Op.or]: whereConditions,
            };
        }

        return {};
    }

    protected getParsedWhereValue(column: any, operator: string, value: any | any[]): WhereAttributeHash | Where {
        switch (operator) {
            case '=':
                return { [Op.eq]: value };
            case '!=':
                return { [Op.not]: value };
            case '<':
                return { [Op.lt]: value };
            case '<=':
                return { [Op.lte]: value };
            case '>':
                return { [Op.gt]: value };
            case '>=':
                return { [Op.gte]: value };
            case 'like':
            case 'ilike':
                return { [Op.iLike]: `%${value}%` };
            case 'between':
                return { [Op.between]: value };
            case 'in':
                return { [Op.in]: value };
            case 'notin':
                return { [Op.notIn]: value };
            case 'any':
                return { [Op.any]: value };
            case 'isnull':
                return { [Op.is]: null };
            case 'date_year':
                return sequelize.where(sequelize.fn('date_part', 'year', sequelize.col(column)), value);
            case 'date_isoyear':
                return sequelize.where(sequelize.fn('date_part', 'isoyear', sequelize.col(column)), value);
            case 'date_month':
                return sequelize.where(sequelize.fn('date_part', 'month', sequelize.col(column)), value);
            case 'date_day':
                return sequelize.where(sequelize.fn('date_part', 'day', sequelize.col(column)), value);
            case 'date_dow':
                return sequelize.where(sequelize.fn('date_part', 'dow', sequelize.col(column)), value);
            case 'date_isodow':
                return sequelize.where(sequelize.fn('date_part', 'isodow', sequelize.col(column)), value);
            case 'date_doy':
                return sequelize.where(sequelize.fn('date_part', 'doy', sequelize.col(column)), value);
        }
    }

    private setIncludes(include: string[] | IInclude, selectGroup: ISelectGroup): Includeable[] {
        // Control if include is a object
        let isObject = false;

        let includes: string[] = [];

        if (isArray(include)) {
            includes = include;
        } else {
            includes = Object.keys(include);
            isObject = true;
        }

        return this.generateIncludes(
            includes,
            this.relations,
            selectGroup,
            isObject ? include : {},
        );
    }

    private generateIncludes(includes: string[], relations: IRelations, selectGroup: ISelectGroup, requiredSettings: {}, level = ''): Includeable[] {
        const parsedIncludes = [];

        includes.forEach(identifier => {
            const wholeIdentifier = level ? level + '.' + identifier : identifier;

            let includeSettings = {};

            const identifierPart = identifier.split(/\.(.+)/);

            const relation = relations[identifierPart[0]];

            if (relation) {
                // If model is defined in nested relation model, get model
                const model = relation.model || relation;

                includeSettings = {
                    model,
                    as: identifierPart[0],
                    attributes: selectGroup[identifierPart[0]],
                    required: requiredSettings[wholeIdentifier] || false,
                };

                if (identifierPart[1] && relation.nested && relation.nested[identifierPart[1]]) {
                    // tslint:disable-next-line: no-string-literal
                    includeSettings['include'] = this.generateIncludes(
                        [identifierPart[1]],
                        relation.nested,
                        selectGroup,
                        requiredSettings,
                        identifierPart[0],
                    );
                }
            }

            parsedIncludes.push(includeSettings);
        });

        return parsedIncludes;
    }

    private getIdentifier(model: any): string {
        if (typeof model === 'string') {
            return model.toString();
        } else {
            // tslint:disable-next-line: no-string-literal
            return model['id'] ? model['id'].toString() : null;
        }
    }
}
