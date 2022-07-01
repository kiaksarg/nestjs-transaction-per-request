import shajs from 'sha.js';
import { TransactionalConnection } from '@modules/common/services/transactional-connection';
import { parseTakeSkipParams } from './parse_take_skip_params';

export const getTakeSkipQuery = (qb, entity, connection: TransactionalConnection, options) => {
  const metadata = qb.expressionMap.mainAlias.metadata;
  const mainAliasName = qb.expressionMap.mainAlias.name;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selects, orderBys] = createOrderByCombinedWithSelectExpression('distinctAlias', qb);

  const querySelects = metadata.primaryColumns.map((primaryColumn) => {
    const distinctAlias = qb.escape('distinctAlias');
    const columnAlias = qb.escape(
      buildAlias(qb.connection.driver, mainAliasName, primaryColumn.databaseName),
    );
    if (!orderBys[columnAlias])
      // make sure we aren't overriding user-defined order in inverse direction
      orderBys[columnAlias] = 'ASC';

    const alias = buildAlias(
      qb.connection.driver,
      'ids_' + mainAliasName,
      primaryColumn.databaseName,
    );

    return `${distinctAlias}.${columnAlias} AS ${qb.escape(alias)}`;
  });

  const { take, skip } = parseTakeSkipParams(options);

  return (
    connection
      .getRepository(entity)
      .createQueryBuilder()
      .select(`DISTINCT ${querySelects.join(', ')}`)
      // .addSelect(selects)
      .from(`(${qb.clone().orderBy().getQuery()})`, 'distinctAlias')
      .offset(skip)
      .limit(take)
      .orderBy(orderBys)
      .cache(
        qb.expressionMap.cache ? qb.expressionMap.cache : qb.expressionMap.cacheId,
        qb.expressionMap.cacheDuration,
      )
      .setParameters(qb.getParameters())
      .setNativeParameters(qb.expressionMap.nativeParameters)
      .getQueryAndParameters()
  );
};

export const buildAlias = (
  { maxAliasLength },
  buildOptions: { shorten?: boolean; joiner?: string } | string,
  ...alias: string[]
): string => {
  if (typeof buildOptions === 'string') {
    alias.unshift(buildOptions);
    buildOptions = { shorten: false, joiner: '_' };
  } else {
    buildOptions = Object.assign({ shorten: false, joiner: '_' }, buildOptions);
  }

  const newAlias = alias.length === 1 ? alias[0] : alias.join(buildOptions.joiner);
  if (maxAliasLength && maxAliasLength > 0 && newAlias.length > maxAliasLength) {
    if (buildOptions.shorten === true) {
      const shortenedAlias = shorten(newAlias);
      if (shortenedAlias.length < maxAliasLength) {
        return shortenedAlias;
      }
    }

    return hash(newAlias, { length: maxAliasLength });
  }

  return newAlias;
};

export interface IShortenOptions {
  /** String used to split "segments" of the alias/column name */
  separator?: string;
  /** Maximum length of any "segment" */
  segmentLength?: number;
  /** Length of any "term" in a "segment"; "OrderItem" is a segment, "Order" and "Items" are terms */
  termLength?: number;
}

export function shorten(input: string, options: IShortenOptions = {}): string {
  const { segmentLength = 4, separator = '__', termLength = 2 } = options;

  const segments = input.split(separator);
  const shortSegments = segments.reduce((acc: string[], val: string) => {
    // split the given segment into many terms based on an eventual camel cased name
    const segmentTerms = val.replace(/([a-z\xE0-\xFF])([A-Z\xC0-\xDF])/g, '$1 $2').split(' ');
    // "OrderItemList" becomes "OrItLi", while "company" becomes "comp"
    const length = segmentTerms.length > 1 ? termLength : segmentLength;
    const shortSegment = segmentTerms.map((term) => term.substr(0, length)).join('');

    acc.push(shortSegment);
    return acc;
  }, []);

  return shortSegments.join(separator);
}

interface IHashOptions {
  length?: number;
}

export function hash(input: string, options: IHashOptions = {}): string {
  const hashFunction = shajs('sha256');

  hashFunction.update(input, 'utf8');

  const hashedInput = hashFunction.digest('hex');

  if (options.length) {
    return hashedInput.slice(0, options.length);
  }

  return hashedInput;
}

function createOrderByCombinedWithSelectExpression(parentAlias: string, qb) {
  // if table has a default order then apply it
  const orderBys = qb.expressionMap.allOrderBys;
  const selectString = Object.keys(orderBys)
    .map((orderCriteria) => {
      if (orderCriteria.indexOf('.') !== -1) {
        const criteriaParts = orderCriteria.split('.');
        const aliasName = criteriaParts[0];
        const propertyPath = criteriaParts.slice(1).join('.');
        const alias = qb.expressionMap.findAliasByName(aliasName);
        const column = alias.metadata.findColumnWithPropertyPath(propertyPath);
        return (
          qb.escape(parentAlias) +
          '.' +
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          qb.escape(buildAlias(qb.connection.driver, aliasName, column!.databaseName))
        );
      } else {
        if (
          qb.expressionMap.selects.find(
            (select) => select.selection === orderCriteria || select.aliasName === orderCriteria,
          )
        )
          return qb.escape(parentAlias) + '.' + orderCriteria;

        return '';
      }
    })
    .join(', ');

  const orderByObject = {};
  Object.keys(orderBys).forEach((orderCriteria) => {
    if (orderCriteria.indexOf('.') !== -1) {
      const criteriaParts = orderCriteria.split('.');
      const aliasName = criteriaParts[0];
      const propertyPath = criteriaParts.slice(1).join('.');
      const alias = qb.expressionMap.findAliasByName(aliasName);
      const column = alias.metadata.findColumnWithPropertyPath(propertyPath);
      orderByObject[
        qb.escape(parentAlias) +
          '.' +
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          qb.escape(buildAlias(qb.connection.driver, aliasName, column!.databaseName))
      ] = orderBys[orderCriteria];
    } else {
      if (
        qb.expressionMap.selects.find(
          (select) => select.selection === orderCriteria || select.aliasName === orderCriteria,
        )
      ) {
        orderByObject[qb.escape(parentAlias) + '.' + orderCriteria] = orderBys[orderCriteria];
      } else {
        orderByObject[orderCriteria] = orderBys[orderCriteria];
      }
    }
  });

  return [selectString, orderByObject];
}
