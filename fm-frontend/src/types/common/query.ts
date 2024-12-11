/**
 * Operators for where clauses
 */
export declare type Operators =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'inq'
  | 'nin'
  | 'between'
  | 'exists'
  | 'and'
  | 'or'
  | 'like'
  | 'nlike'
  | 'ilike'
  | 'nilike'
  | 'regexp'
/**
 * Matching predicate comparison
 */
export declare type PredicateComparison<PT> = {
  eq?: PT
  neq?: PT
  gt?: PT
  gte?: PT
  lt?: PT
  lte?: PT
  inq?: PT[]
  nin?: PT[]
  between?: [PT, PT]
  exists?: boolean
  like?: PT
  nlike?: PT
  options?: string
  ilike?: PT
  nilike?: PT
  regexp?: string | RegExp
  $regex?: string | RegExp
  $options?: string
  $in?: PT[]
}
/**
 * Value types for `{propertyName: value}`
 */
export declare type ShortHandEqualType = string | number | boolean | Date | Array<string | number | boolean | Date>
/**
 * Key types of a given model, excluding operators
 */
export declare type KeyOf<MT> = Exclude<Extract<keyof MT, string>, Operators>
/**
 * Condition clause
 *
 * @example
 * ```ts
 * {
 *   name: {inq: ['John', 'Mary']},
 *   status: 'ACTIVE',
 *   age: {gte: 40}
 * }
 * ```
 */
export declare type Condition<MT> = {
  [P in KeyOf<MT>]?: PredicateComparison<MT[P]> | (MT[P] & ShortHandEqualType)
}
/**
 * Where clause
 *
 * @example
 * ```ts
 * {
 *   name: {inq: ['John', 'Mary']},
 *   status: 'ACTIVE'
 *   and: [...],
 *   or: [...],
 * }
 * ```
 */
export declare type Where<MT> = (Condition<MT> & IAndClause<MT>) & IOrClause<MT>
/**
 * And clause
 *
 * @example
 * ```ts
 * {
 *   and: [...],
 * }
 * ```
 */
export interface IAndClause<MT> {
  and?: Where<MT>[]
  $and?: Where<MT>[]
}
/**
 * Or clause
 *
 * @example
 * ```ts
 * {
 *   or: [...],
 * }
 * ```
 */
export interface IOrClause<MT> {
  or?: Where<MT>[]
  $or?: Where<MT>[]
}
/**
 * Order by direction
 */
export declare type Direction = 'ASC' | 'DESC'
/**
 * Order by
 *
 * Example:
 * `{afieldname: 'ASC'}`
 */
export declare type Order<MT = Record<string, unknown>> = {
  [P in keyof MT]: Direction
}
/**
 * Selection of fields
 *
 * Example:
 * `{afieldname: true}`
 */
export declare type Fields<MT = Record<string, unknown>> = {
  [P in keyof MT]?: boolean
}
/**
 * Inclusion of related items
 *
 * Note: scope means filter on related items
 *
 * Example:
 * `{relation: 'aRelationName', scope: {<AFilterObject>}}`
 */
export interface IInclusion {
  relation: string
  scope?: IFilter<Record<string, unknown>>
}
/**
 * Query filter object
 */
export interface IFilter<MT> {
  /**
   * The matching criteria
   */
  where?: Where<MT>
  /**
   * To include/exclude fields
   */
  fields?: Fields<MT> | string[]
  /**
   * Sorting order for matched entities. Each item should be formatted as
   * `fieldName ASC` or `fieldName DESC`.
   * For example: `['f1 ASC', 'f2 DESC', 'f3 ASC']`.
   *
   * We might want to use `Order` in the future. Keep it as `string[]` for now
   * for compatibility with LoopBack 3.x.
   */
  order?: string | string[]
  /**
   * Maximum number of entities
   */
  limit?: number
  /**
   * Skip N number of entities
   */
  skip?: number
  /**
   * Offset N number of entities. An alias for `skip`
   */
  offset?: number
  /**
   * To include related objects
   */
  include?: string[] | IInclusion[]
}

export type IFilterExcludingWhere<MT> = Omit<IFilter<MT>, 'where'>

export type IWhere<MT> = Where<MT>

/**
 * Count of Model instances that were successful for methods like `updateAll`,
 * `deleteAll`, etc.
 */
export interface ICount {
  count: number
}

/** Allow to update just a few prop base on target model */
export declare type UpdateBody<MT> = {
  [P in KeyOf<MT>]?: MT[P]
}
