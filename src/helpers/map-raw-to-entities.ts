import { RelationIdLoader } from 'typeorm/query-builder/relation-id/RelationIdLoader';
import { RawSqlResultsToEntityTransformer } from 'typeorm/query-builder/transformer/RawSqlResultsToEntityTransformer';
import { RelationCountLoader } from 'typeorm/query-builder/relation-count/RelationCountLoader';
import { Connection, SelectQueryBuilder } from 'typeorm';

export const mapRawToEntity = async (
  connection: Connection,
  qb: SelectQueryBuilder<any>,
  rawResult: any,
) => {
  const queryRunner = connection.manager.connection.createQueryRunner();

  const relationIdLoader = new RelationIdLoader(
    connection,
    queryRunner,
    qb.expressionMap.relationIdAttributes,
  );

  const relationCountLoader = new RelationCountLoader(
    connection,
    queryRunner,
    qb.expressionMap.relationCountAttributes,
  );

  const rawRelationIdResults = await relationIdLoader.load(rawResult);
  const rawRelationCountResults = await relationCountLoader.load(rawResult);

  const transformer = new RawSqlResultsToEntityTransformer(
    qb.expressionMap,
    connection.driver,
    rawRelationIdResults,
    rawRelationCountResults,
    queryRunner,
  );

  return transformer.transform(rawResult, qb.expressionMap.mainAlias);
};
