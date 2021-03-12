import { isArray, isString } from 'lodash';
import sequelize, { FindAndCountOptions, GroupOption, Model, Op, Order, Sequelize, WhereAttributeHash } from 'sequelize';
import { Where } from 'sequelize/types/lib/utils';
import { v4 } from 'uuid/interfaces';

import { IInclude } from '../query/interfaces/include.interface';
import { CountOptions } from './../query/count-options';
import { FindOptions } from './../query/find-options';
import { IQueryFilter } from './../query/interfaces/query-filter.interface';
import { ISelectGroup } from './../query/interfaces/select-group.interface';
import { QueryOptions } from './../query/query-options';
import { EntityNotFoundError } from './exceptions/entity-not-found.error';
import { IRelations } from './interfaces/relations.interface';
import {
    CountOptions as OrmCountOptions,
    CreateOptions,
    DestroyOptions,
    FindOptions as OrmFindOptions,
    FindOrCreateOptions,
    Identifier,
    Includeable,
    UpdateOptions,
    WhereOptions,
} from './orm-wrapper';

export abstract class BaseRepository<T extends Model> {
    /**
     * Define relations that could be used in includes
     */
    protected relations: IRelations = {};

    /**
     * force setting foreign key of nullable relation to null on update
     */
    protected nullableRelations: string[] = [];

    /**
     * Set default order for queries
     */
    protected defaultOrder: string[][] = [];

    /**
     * Used in specific dependent methods
     */
    protected relatedForeignKey: string = '';

    constructor(protected readonly model: (new () => T) & typeof Model) {
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
    }

    //#region Create

    /**
     * Create model
     *
     * @param {T} model
     * @param {CreateOptions} options
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async create(model: T, options?: CreateOptions): Promise<T> {
        model = await this.beforeCreate(model, options);

        const newModel = await this.model.sequelize.transaction(async t => {
            options = options || {};
            options.transaction = t;

            const newModelToCommit = await this.model.create<T>(model, options);

            return this.afterCreate(newModelToCommit, options);
        });

        return this.afterCreateCommit(newModel);
    }

    /**
     * Execute some action before create model
     *
     * @param {T} model
     * @param {CreateOptions} options
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    async beforeCreate(model: T, options?: CreateOptions): Promise<T> {
        return model;
    }

    /**
     * Execute some action after create model
     *
     * @param {T} model
     * @param {CreateOptions} options
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    afterCreate(model: T, options?: CreateOptions): Promise<T> {
        return Promise.resolve(model);
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

    //#region FindOrCreate

    /**
     * Find or Create model
     *
     * @param {T} model
     * @param {FindOrCreateOptions} options
     * @param {boolean} performatic If true will use findCreateFind instead findOrCreate
     * @returns {Promise<[T, boolean]>}
     * @memberof BaseRepository
     */
    async findOrCreate(model: T, options: Omit<FindOrCreateOptions, 'defaults'>, performatic = true): Promise<[T, boolean]> {
        const findOrCreateOptions: FindOrCreateOptions = { ...options };
        model = await this.beforeFindOrCreate(model, findOrCreateOptions);

        const newModel = await this.model.sequelize.transaction(async t => {
            findOrCreateOptions.transaction = t;
            findOrCreateOptions.defaults = model;

            if (!findOrCreateOptions.where) {
                throw new Error('Is missing where attribute for findOrCreate options');
            }

            const newModelToCommit = await this.model[performatic ? 'findCreateFind' : 'findOrCreate']<T>(findOrCreateOptions);

            return this.afterFindOrCreate(newModelToCommit, options);
        });

        return this.afterFindOrCreateCommit(newModel);
    }

    /**
     * Execute some action before find or create model
     *
     * @param {[T, boolean]} result
     * @param {FindOrCreateOptions} options
     * @returns {Promise<[T, boolean]>}
     * @memberof BaseRepository
     */
    async beforeFindOrCreate(model: T, options?: FindOrCreateOptions): Promise<T> {
        return model;
    }

    afterFindOrCreate(result: [T, boolean], options?: FindOrCreateOptions): Promise<[T, boolean]> {
        return Promise.resolve(result);
    }

    /**
     * Execute some action after create commit model
     *
     * @param {[T, boolean]} result
     * @returns {Promise<[T, boolean]>}
     * @memberof BaseRepository
     */
    async afterFindOrCreateCommit(result: [T, boolean]): Promise<[T, boolean]> {
        return result;
    }

    //#endregion

    //#region Create Many

    async createMany(models: T[] = []): Promise<T[]> {
        models = await this.beforeCreateMany(models);

        let newModels: T[] = [];

        await this.model.sequelize.transaction(async t => {
            const transactionHost = { transaction: t };
            newModels = await this.model.bulkCreate<T>(models, transactionHost);

            return this.afterCreateMany(newModels);
        });

        return this.afterCreateManyCommit(newModels);
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
     * @param {T} model
     * @returns {Promise<T>}
     * @memberof BaseRepository
     */
    afterCreateMany(models: T[]): Promise<T[]> {
        return Promise.resolve(models);
    }

    /**
     * Execute some action after create many models
     *
     * @param {T[]} models
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async afterCreateManyCommit(models: T[]): Promise<T[]> {
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
    async update(model: T, options?: UpdateOptions, modelIdentifier: string = 'id'): Promise<T> {
        model = await this.beforeUpdate(model, options);

        if (!modelIdentifier) {
            throw new Error('Model identifier cannot be empty');
        }

        // tslint:disable-next-line: no-string-literal
        if (!model[modelIdentifier]) {
            throw new EntityNotFoundError(this.model.tableName, 'Undefined identifier');
        }

        // tslint:disable-next-line: no-string-literal
        const identifier = model[modelIdentifier].toString();

        // If exists a options, ensure a where condition exists in options
        if (options && (!options.where || !Object.keys(options.where).length)) {
            options.where = { [modelIdentifier]: identifier };
        }

        // If options is not exists, ensure create a where condition to avoid massive update
        const updateOptions: UpdateOptions = options ? options : { where: { [modelIdentifier]: identifier } };

        const updatedModel = await this.model.sequelize.transaction(async t => {
            updateOptions.transaction = t;

            await this.model.update<T>(model, updateOptions);

            const currentModel = await this.model.findOne<T>(updateOptions);

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
    afterUpdate(model: T): Promise<T> {
        return Promise.resolve(model);
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

    //#region Update All

    async updateAll(model: Partial<T>, options?: UpdateOptions): Promise<T[]> {
        model = await this.beforeUpdateAll(model, options);

        let updatedModels: T[] = [];

        await this.model.sequelize.transaction(async t => {
            options.transaction = t;

            updatedModels = (await this.model.update<T>(model, options))[1];

            return this.afterUpdateAll(updatedModels);
        });

        return this.afterUpdateAllCommit(updatedModels);
    }

    async beforeUpdateAll(model: Partial<T>, options?: UpdateOptions): Promise<Partial<T>> {
        return model;
    }

    afterUpdateAll(models: T[]): Promise<T[]> {
        return Promise.resolve(models);
    }

    async afterUpdateAllCommit(models: T[]): Promise<T[]> {
        return models;
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
    afterUpdateMany(models: T[]): Promise<T[]> {
        return Promise.resolve(models);
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
    afterDelete(rows: number): Promise<number> {
        return Promise.resolve(rows);
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
    afterDeleteMany(rows: number): Promise<number> {
        return Promise.resolve(rows);
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

    /**
     * Find by primary key
     *
     * @param identifier Identifier
     * @param options App parseable options
     * @param strict Inidicate if will throw exception if not found
     */
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

    /**
     * Find using Sequelize where conditions instead app parsed where
     *
     * @param whereCondition Sequelize where condition
     * @param options App parseable options
     * @param strict Inidicate if will throw exception if not found
     */
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

    /**
     * Find app where conditions instead app parsed where
     *
     * @param options App parseable options
     * @param strict Inidicate if will throw exception if not found
     */
    async find(options?: QueryOptions, strict = true): Promise<T> {
        const transformedOptions = this.transformQueryOptionsDtoToFindOptions(options);

        const result = await this.model.findOne<T>(transformedOptions);

        if (!result) {
            if (strict) {
                throw new EntityNotFoundError(this.model.name, options.where);
            }

            return null;
        }

        return result;
    }

    /**
     * Paginated query
     *
     * @param {QueryOptions} [options] App parseable options
     * @returns {Promise<{ rows: T[]; count: number }>}
     * @memberof BaseRepository
     */
    async paginatedQuery(options?: QueryOptions): Promise<{ rows: T[]; count: number }> {
        const transformedOptions: FindAndCountOptions = this.transformQueryOptionsDtoToFindOptions(options);

        if (transformedOptions.include && transformedOptions.include.length) {
            transformedOptions.distinct = true;
        }

        return this.model.findAndCountAll<T>(transformedOptions);
    }

    /**
     * Query
     *
     * @param {QueryOptions} [options] App parseable options
     * @returns {Promise<T[]>}
     * @memberof BaseRepository
     */
    async query(options?: QueryOptions): Promise<T[]> {
        const transformedOptions = this.transformQueryOptionsDtoToFindOptions(options);

        return this.model.findAll<T>(transformedOptions);
    }

    //#endregion

    //#region Dependent methods

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

    //#endregion

    async count(options?: CountOptions): Promise<number> {
        const transformedOptions: OrmCountOptions = this.transformQueryOptionsDtoToCountOptions(options);

        const result = await this.model.findAll<T>(transformedOptions);

        // tslint:disable-next-line: no-string-literal
        return result && result[0] ? result[0]['count'] : 0;
    }

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

    protected transformQueryOptionsDtoToCountOptions(options: CountOptions): OrmCountOptions {
        options = options || {};

        const condition: OrmCountOptions = {};

        const { col, group, include, includeDeleted } = options;

        // Select
        condition.attributes = [[Sequelize.fn('COUNT', Sequelize.col(col)), 'count']];

        // Col
        condition.col = col;

        // Group
        condition.group = this.prefixGroupColumns(group);

        // Distinct
        condition.distinct = options.distinct;

        // Where
        if (options.where) {
            condition.where = this.transformWhereCondition(options.where);
        }

        // Include relation
        if (include) {
            condition.include = this.setIncludes(include, {}, []);
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

    private setIncludes(include: string[] | IInclude, selectGroup: ISelectGroup, defaultAttribute?: any[]): Includeable[] {
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
            defaultAttribute,
        );
    }

    private generateIncludes(
        includes: string[],
        relations: IRelations,
        selectGroup: ISelectGroup,
        requiredSettings: {},
        defaultAttribute: any[],
        level = '',
    ): Includeable[] {
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
                    attributes: selectGroup[identifierPart[0]] || defaultAttribute,
                    required: requiredSettings[wholeIdentifier] || false,
                };

                if (identifierPart[1] && relation.nested && relation.nested[identifierPart[1]]) {
                    // tslint:disable-next-line: no-string-literal
                    includeSettings['include'] = this.generateIncludes(
                        [identifierPart[1]],
                        relation.nested,
                        selectGroup,
                        requiredSettings,
                        defaultAttribute,
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

    private prefixGroupColumns(columns: GroupOption): GroupOption {
        if (isArray(columns)) {
            return columns.map(i => {
                if (isString(i)) {
                    return this.prefixColumn(i);
                }
                return i;
            });
        }

        if (isString(columns)) {
            return this.prefixColumn(columns);
        }

        return columns;
    }

    private prefixColumn(column: string): string {
        const part = column.split('.');

        if (part.length === 1) {
            return `${this.model.name}.${column}`;
        }

        return column;
    }
}
