import { BaseEntity } from '@modules/common/entities';
import { OperatorEnum } from './constants';
export type SortOrder = 'ASC' | 'DESC';

export interface StringOperators {
  eq?: string;
  notEq?: string;
  contains?: string;
  notContains?: string;
  search?: string;
  in?: string[];
  notIn?: string[];
  regex?: string;
}

export interface BooleanOperators {
  eq?: boolean;
}

export interface NumberRange {
  start: number;
  end: number;
}

export interface NumberOperators {
  eq?: number;
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  between?: NumberRange;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateOperators {
  eq?: Date;
  before?: Date;
  after?: Date;
  between?: DateRange;
}

export type DeepPartial<T> = {
  [P in keyof T]?:
    | null
    | (T[P] extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : DeepPartial<T[P]>);
};

// prettier-ignore
export type PrimitiveFields<T extends BaseEntity> = {
  [K in keyof T]: T[K] extends string | number | string | boolean | Date ? K : never
}[keyof T];

// prettier-ignore
export type FilterParameter<T extends BaseEntity> = {
  [K in PrimitiveFields<T>]?: T[K] extends string ? StringOperators
      : T[K] extends number ? NumberOperators
          : T[K] extends boolean ? BooleanOperators
              : T[K] extends Date ? DateOperators : StringOperators;
};

// prettier-ignore
export type SortParameter<T extends BaseEntity> = {
  [K in PrimitiveFields<T>]?: SortOrder
};

export type NullOptionals<T> = {
  [K in keyof T]: undefined extends T[K] ? NullOptionals<T[K]> | null : NullOptionals<T[K]>;
};

/**
 * A type representing the type rather than instance of a class.
 */
export interface Type<T> extends Function {
  // tslint:disable-next-line:callable-types
  new (...args: any[]): T;
}

export interface ListQueryOptions<T extends BaseEntity> {
  take?: number | null;
  skip?: number | null;
  after?: bigint;
  before?: bigint;
  sort?: NullOptionals<SortParameter<T>> | null;
  filter?: NullOptionals<FilterParameter<T>> | null;
  operator?: OperatorEnum;
  deactivatedItems?: boolean | null;
}
