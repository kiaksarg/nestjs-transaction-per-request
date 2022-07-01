import { getColumnMetadata } from './../utils/connection-utils';
import { BaseEntity } from '@modules/common/entities';
import { Connection, OrderByCondition } from 'typeorm';

import { Type } from '@nestjs/common';
import { UserInputError } from '@common/error/errors';

/**
 * Parses the provided SortParameter array against the metadata of the given entity, ensuring that only
 * valid fields are being sorted against. The output assumes
 * @param connection
 * @param entity
 * @param sortParams
 */
export function parseSortParams<T extends BaseEntity>(
  connection: Connection,
  entity: Type<T>,
  sortParams?: any,
  customPropertyMap?: { [name: string]: string },
): OrderByCondition {
  if (!sortParams || Object.keys(sortParams).length === 0) {
    return {};
  }
  const { columns, alias } = getColumnMetadata(connection, entity);
  const output: OrderByCondition = {};
  for (const [key, order] of Object.entries(sortParams)) {
    const matchingColumn = columns.find((c) => c.propertyName === key);
    if (matchingColumn) {
      output[`${alias}.${matchingColumn.propertyPath}`] = order as any;
    } else if (customPropertyMap?.[key]) {
      output[customPropertyMap[key]] = order as any;
    } else {
      throw new UserInputError('error.invalid-sort-field');
    }
  }
  return output;
}

// function getValidSortFields(columns: ColumnMetadata[]): string[] {
//   return unique(columns.map((c) => c.propertyName));
// }
