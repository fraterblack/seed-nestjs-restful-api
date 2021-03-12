import {
    AndOperator,
    Association,
    CountOptions as OrmCountOptions,
    CreateOptions as OrmCreateOptions,
    DestroyOptions as OrmDestroyOptions,
    FindOptions as OrmFindOptions,
    FindOrCreateOptions as OrmFindOrCreateOptions,
    GroupOption as OrmGroupOption,
    IncludeOptions,
    Model,
    OrOperator,
    UpdateOptions as OrmUpdateOptions,
    WhereAttributeHash,
} from 'sequelize';
import { Literal, Where } from 'sequelize/types/lib/utils';

/**
 * Wrapper for all specific interfaces, types and orm classes
 * It avoid expose ORM to service layer
 */

/**
 * Possible types for primary keys
 */
export type Identifier = number | string | Buffer;

/**
 * The type accepted by every `where` option
 */
export type WhereOptions = WhereAttributeHash | AndOperator | OrOperator | Literal | Where;

/**
 * Options for eager-loading associated models, also allowing for all associations to be loaded at once
 */
export type Includeable = typeof Model | Association | IncludeOptions | { all: true } | string;

export type GroupOption = OrmGroupOption;

/**
 * Options that are passed to any model creating a SELECT query
 *
 * A hash of options to describe the scope of the search
 */
// tslint:disable-next-line: no-empty-interface
export interface FindOptions extends OrmFindOptions { }

/**
 * Options used for Model.create
 */
// tslint:disable-next-line: no-empty-interface
export interface CreateOptions extends OrmCreateOptions { }

/**
 * Options used for Model.findOrCreate
 */
// tslint:disable-next-line: no-empty-interface
export interface FindOrCreateOptions extends OrmFindOrCreateOptions { }

/**
 * Options used for Model.update
 */
// tslint:disable-next-line: no-empty-interface
export interface UpdateOptions extends OrmUpdateOptions { }

/**
 * Options used for Model.destroy
 */
// tslint:disable-next-line: no-empty-interface
export interface DestroyOptions extends OrmDestroyOptions { }

/**
 * Count the number of records matching the provided where clause.
 */
// tslint:disable-next-line: no-empty-interface
export interface CountOptions extends OrmCountOptions { }
