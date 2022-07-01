import { getColumnMetadata } from './../../../utils/connection-utils';
import { UserInputError } from './../../../common/error/errors';
import { parseSortParams } from './../../../helpers/parse-sort-params';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { BaseEntity } from '@modules/common/entities';
import {
  FindOneOptions,
  SelectQueryBuilder,
  FindOptionsUtils,
  FindManyOptions,
  Brackets,
} from 'typeorm';
import { BetterSqlite3Driver } from 'typeorm/driver/better-sqlite3/BetterSqlite3Driver';
import { SqljsDriver } from 'typeorm/driver/sqljs/SqljsDriver';
import { Type, ListQueryOptions } from '@common/common-types.interface.type';
import { Logger } from '../../../config/logger/custom-logger';
import { parseFilterParams } from './../../../helpers/parse-filter-params';
import { OperatorEnum } from '@common/constants';
import { RequestContext } from '@modules/api/common/request-context';
import { TransactionalConnection } from '../services/transactional-connection';
import { addJoinsToQueryBuilder, JoinListType } from 'src/helpers/add-joins-to-query-builder';
import { parseTakeSkipParams } from 'src/helpers/parse_take_skip_params';

export type ExtendedListQueryOptions<T extends BaseEntity> = {
  relations?: string[];
  // where?: FindConditions<T>;
  where?: any;
  orderBy?: FindOneOptions<T>['order'];
  /**
   * When a RequestContext is passed, then the query will be
   * executed as part of any outer transaction.
   */
  ctx?: RequestContext;
  /**
   * One of the main tasks of the ListQueryBuilder is to auto-generate filter and sort queries based on the
   * available columns of a given entity. However, it may also be sometimes desirable to allow filter/sort
   * on a property of a relation. In this case, the `customPropertyMap` can be used to define a property
   * of the `options.sort` or `options.filter` which does not correspond to a direct column of the current
   * entity, and then provide a mapping to the related property to be sorted/filtered.
   *
   * Example: we want to allow sort/filter by and Order's `customerLastName`. The actual lastName property is
   * not a column in the Order table, it exists on the Customer entity, and Order has a relation to Customer via
   * `Order.customer`. Therefore we can define a customPropertyMap like this:
   *
   * ```ts
   * const qb = this.listQueryBuilder.build(Order, options, {
   *   relations: ['customer'],
   *   customPropertyMap: {
   *       customerLastName: 'customer.lastName',
   *   },
   * };
   * ```
   */
  customPropertyMap?: { [name: string]: string };
  takeSkip?: boolean;
  offsetLimit?: boolean;
  select?: string;
  joins?: JoinListType[];
};

@Injectable()
export class ListQueryBuilder implements OnApplicationBootstrap {
  constructor(private connection: TransactionalConnection) {}

  onApplicationBootstrap(): any {
    this.registerSQLiteRegexpFunction();
  }

  /**
   * Creates and configures a SelectQueryBuilder for queries that return paginated lists of entities.
   */
  build<T extends BaseEntity>(
    entity: Type<T>,
    options: ListQueryOptions<T> = {},
    extendedOptions: ExtendedListQueryOptions<T> = { takeSkip: true, offsetLimit: false },
  ): SelectQueryBuilder<T> {
    if (this.connection.rawConnection.options.type === 'sqlite') {
      for (const [key, val] of Object.entries(extendedOptions?.where)) {
        extendedOptions.where[key] = typeof val === 'bigint' ? Number(val) : val;
      }
    }

    const rawConnection = this.connection.rawConnection;
    const { take, skip } = parseTakeSkipParams(options);

    const repo = extendedOptions.ctx
      ? this.connection.getRepository(extendedOptions.ctx, entity)
      : this.connection.getRepository(entity);

    const qb = repo.createQueryBuilder(entity.name.toLowerCase());

    if (extendedOptions.select) qb.select(`${entity.name.toLowerCase()}.${extendedOptions.select}`);

    if (extendedOptions.takeSkip ?? true) {
      FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
        relations: extendedOptions.relations,
        take,
        skip,
        where: extendedOptions.where || {},
      } as FindManyOptions<T>);
    } else {
      FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
        relations: extendedOptions.relations,
        where: extendedOptions.where || {},
      } as FindManyOptions<T>);
    }

    addJoinsToQueryBuilder(qb, extendedOptions.joins ?? []);

    if (extendedOptions.offsetLimit ?? false) {
      qb.offset(skip);
      qb.limit(take);
    }

    // tslint:disable-next-line:no-non-null-assertion
    FindOptionsUtils.joinEagerRelations(
      qb,
      qb.alias,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      qb.expressionMap.mainAlias!.metadata,
    );

    const { customPropertyMap } = extendedOptions;
    if (customPropertyMap) {
      this.normalizeCustomPropertyMap(customPropertyMap, qb);
    }

    let sort = parseSortParams(
      rawConnection,
      entity,
      Object.assign({}, options.sort, extendedOptions.orderBy),
      customPropertyMap,
    );

    const filter = parseFilterParams(rawConnection, entity, options.filter, customPropertyMap);

    if (filter && filter.length > 0 && extendedOptions.where) {
      qb.andWhere(
        new Brackets((qBuilder) =>
          filter.forEach(({ clause, parameters }) => {
            options.operator && options.operator === OperatorEnum.Or
              ? qBuilder.orWhere(clause, parameters)
              : qBuilder.andWhere(clause, parameters);
          }),
        ),
      );
    } else {
      filter.forEach(({ clause, parameters }) => {
        if (options.operator && options.operator === OperatorEnum.Or)
          qb.orWhere(clause, parameters);
        else qb.andWhere(clause, parameters);
      });
    }

    if (options.after || options.before) {
      if (options.sort) {
        for (const [key, value] of Object.entries(options.sort)) {
          if (key === 'id') {
            const order = { id: value === 'ASC' ? 'DESC' : 'ASC' };
            const ope = options.before
              ? order.id === 'DESC'
                ? '<'
                : '>'
              : order.id === 'DESC'
              ? '>'
              : '<';

            sort = options.before
              ? parseSortParams(
                  rawConnection,
                  entity,
                  Object.assign({}, order, extendedOptions.orderBy),
                  customPropertyMap,
                )
              : sort;

            const { alias } = getColumnMetadata(rawConnection, entity);

            qb.andWhere(`${alias}.id ${ope} :id`, {
              id: options.after ? options.after.toString() : options.before.toString(),
            });
          } else {
            throw new UserInputError(
              "error.list-query-after: 'After' or 'Before' can only be used with sort order by id",
            );
          }
        }
      } else {
        throw new UserInputError(
          "error.list-query-after: 'After' or 'Before' can only be used with sort order by id",
        );
      }
    }

    qb.orderBy(sort);

    return qb;
  }

  /**
   * If a customPropertyMap is provided, we need to take the path provided and convert it to the actual
   * relation aliases being used by the SelectQueryBuilder.
   *
   * This method mutates the customPropertyMap object.
   */
  normalizeCustomPropertyMap(
    customPropertyMap: { [name: string]: string },
    qb: SelectQueryBuilder<any>,
  ) {
    for (const [key, value] of Object.entries(customPropertyMap)) {
      const parts = customPropertyMap[key].split('.');
      const entityPart = 2 <= parts.length ? parts[parts.length - 2] : qb.alias;
      const columnPart = parts[parts.length - 1];
      const relationAlias = qb.expressionMap.aliases.find(
        (a) => a.metadata.tableNameWithoutPrefix === entityPart,
      );
      if (relationAlias) {
        customPropertyMap[key] = `${relationAlias.name}.${columnPart}`;
      } else {
        Logger.error(
          `The customPropertyMap entry "${key}:${value}" could not be resolved to a related table`,
        );
        delete customPropertyMap[key];
      }
    }
  }

  /**
   * Registers a user-defined function (for flavors of SQLite driver that support it)
   * so that we can run regex filters on string fields.
   */
  private registerSQLiteRegexpFunction() {
    const regexpFn = (pattern: string, value: string) => {
      const result = new RegExp(`${pattern}`, 'i').test(value);
      return result ? 1 : 0;
    };
    const dbType = this.connection.rawConnection.options.type;
    if (dbType === 'better-sqlite3') {
      const driver = this.connection.rawConnection.driver as BetterSqlite3Driver;
      driver.databaseConnection.function('regexp', regexpFn);
    }
    if (dbType === 'sqljs') {
      const driver = this.connection.rawConnection.driver as SqljsDriver;
      driver.databaseConnection.create_function('regexp', regexpFn);
    }
  }
}
