import { ObjectLiteral } from 'typeorm';

export const addJoinsToQueryBuilder = (qb, joins = []) => {
  for (let index = 0; index < joins.length; index++) {
    const join = joins[index];
    switch (join.type) {
      case 'leftJoin':
        if (join.condition)
          qb.leftJoin(join.entity, join.alias, join.condition, join.parameters ?? {});
        else qb.leftJoin(join.entity, join.alias);
        break;
      case 'leftJoinAndMapMany':
        qb.leftJoinAndMapMany(join.mapToProperty, join.entity, join.alias, join.condition);
        break;
      case 'leftJoinAndMapOne':
        qb.leftJoinAndMapOne(join.mapToProperty, join.entity, join.alias, join.condition);
        break;
      case 'leftJoinAndSelect':
        if (join.condition)
          qb.leftJoinAndSelect(join.property, join.alias, join.condition, join.parameters ?? {});
        else qb.leftJoinAndSelect(join.property, join.alias);
        break;
      default:
        throw new Error('join type was not found.');
    }
  }
};

export type JoinListType = {
  type: 'leftJoinAndMapOne' | 'leftJoinAndMapMany' | 'leftJoinAndSelect' | 'leftJoin';
  mapToProperty?: string;
  property?: string;
  entity?: any | string;
  alias?: string;
  condition?: string;
  parameters?: ObjectLiteral;
};
