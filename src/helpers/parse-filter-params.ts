import { BaseEntity } from '@modules/common/entities';
import { Connection, ConnectionOptions } from 'typeorm';
import { DateUtils } from 'typeorm/util/DateUtils';
import { InternalServerError, UserInputError } from '../common/error/errors';

import {
  BooleanOperators,
  DateOperators,
  FilterParameter,
  NullOptionals,
  NumberOperators,
  StringOperators,
  Type,
} from '../common/common-types.interface.type';

import { getColumnMetadata } from '../utils/connection-utils';
import { assertNever } from '../utils/shared-utils';

export interface WhereCondition {
  clause: string;
  parameters: { [param: string]: string | number };
}

type AllOperators = StringOperators & BooleanOperators & NumberOperators & DateOperators;
type Operator = { [K in keyof AllOperators]-?: K }[keyof AllOperators];

export function parseFilterParams<T extends BaseEntity>(
  connection: Connection,
  entity: Type<T>,
  filterParams?: NullOptionals<FilterParameter<T>> | null,
  customPropertyMap?: { [name: string]: string },
): WhereCondition[] {
  if (!filterParams) {
    return [];
  }
  const { columns, translationColumns, alias } = getColumnMetadata(connection, entity);
  const output: WhereCondition[] = [];
  const dbType = connection.options.type;
  let argIndex = 1;
  for (const [key, operation] of Object.entries(filterParams)) {
    if (operation) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      for (const [operator, operand] of Object.entries(operation as object)) {
        let fieldName: string;
        if (columns.find((c) => c.propertyName === key)) {
          fieldName = `${alias}.${key}`;
        } else if (translationColumns.find((c) => c.propertyName === key)) {
          const translationsAlias = connection.namingStrategy.eagerJoinRelationAlias(
            alias,
            'translations',
          );
          fieldName = `${translationsAlias}.${key}`;
        } else if (customPropertyMap?.[key]) {
          fieldName = customPropertyMap[key];
        } else {
          throw new UserInputError('error.invalid-filter-field');
        }
        const condition = buildWhereCondition(
          fieldName,
          operator as Operator,
          operand,
          argIndex,
          dbType,
        );
        output.push(condition);
        argIndex++;
      }
    }
  }

  return output;
}

function buildWhereCondition(
  fieldName: string,
  operator: Operator,
  operand: any,
  argIndex: number,
  dbType: ConnectionOptions['type'],
): WhereCondition {
  switch (operator) {
    case 'eq':
      return {
        clause: `${fieldName} = :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: convertDate(operand) },
      };
    case 'notEq':
      return {
        clause: `${fieldName} != :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: convertDate(operand) },
      };
    case 'contains': {
      const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';
      return {
        clause: `${fieldName} ${LIKE} :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: `%${operand.trim()}%` },
      };
    }
    case 'notContains': {
      const LIKE = dbType === 'postgres' ? 'ILIKE' : 'LIKE';
      return {
        clause: `${fieldName} NOT ${LIKE} :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: `%${operand.trim()}%` },
      };
    }
    case 'search': {
      operand = String(operand).replace('(', ' ');
      operand = String(operand).replace(')', ' ');
      operand = String(operand).replace('-', '');

      return {
        clause: `MATCH(${fieldName}) AGAINST(:arg${argIndex} IN BOOLEAN MODE)`,
        parameters: {
          [`arg${argIndex}`]: String(operand).trim() ? `+${String(operand).trim()}*` : '',
        },
      };
    }
    case 'in':
      return {
        clause: `${fieldName} IN (:...arg${argIndex})`,
        parameters: { [`arg${argIndex}`]: operand },
      };
    case 'notIn':
      return {
        clause: `${fieldName} NOT IN (:...arg${argIndex})`,
        parameters: { [`arg${argIndex}`]: operand },
      };
    case 'regex':
      return {
        clause: getRegexpClause(fieldName, argIndex, dbType),
        parameters: { [`arg${argIndex}`]: operand },
      };
    case 'lt':
    case 'before':
      return {
        clause: `${fieldName} < :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: convertDate(operand) },
      };
    case 'gt':
    case 'after':
      return {
        clause: `${fieldName} > :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: convertDate(operand) },
      };
    case 'lte':
      return {
        clause: `${fieldName} <= :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: operand },
      };
    case 'gte':
      return {
        clause: `${fieldName} >= :arg${argIndex}`,
        parameters: { [`arg${argIndex}`]: operand },
      };
    case 'between':
      return {
        clause: `${fieldName} BETWEEN :arg${argIndex}_a AND :arg${argIndex}_b`,
        parameters: {
          [`arg${argIndex}_a`]: convertDate(operand.start),
          [`arg${argIndex}_b`]: convertDate(operand.end),
        },
      };
    default:
      assertNever(operator);
  }
  return {
    clause: '1',
    parameters: {},
  };
}

/**
 * Converts a JS Date object to a string format recognized by all DB engines.
 */
function convertDate(input: Date | string | number): string | number {
  if (input instanceof Date) {
    return DateUtils.mixedDateToUtcDatetimeString(input);
  }
  return input;
}

/**
 * Returns a valid regexp clause based on the current DB driver type.
 */
function getRegexpClause(
  fieldName: string,
  argIndex: number,
  dbType: ConnectionOptions['type'],
): string {
  switch (dbType) {
    case 'mariadb':
    case 'mysql':
    case 'sqljs':
    case 'better-sqlite3':
    case 'aurora-data-api':
      return `${fieldName} REGEXP :arg${argIndex}`;
    case 'postgres':
    case 'aurora-data-api-pg':
    case 'cockroachdb':
      return `${fieldName} ~* :arg${argIndex}`;
    // The node-sqlite3 driver does not support user-defined functions
    // and therefore we are unable to define a custom regexp
    // function. See https://github.com/mapbox/node-sqlite3/issues/140
    case 'sqlite':
    default:
      throw new InternalServerError(
        `The 'regex' filter is not available when using the '${dbType}' driver`,
      );
  }
}
