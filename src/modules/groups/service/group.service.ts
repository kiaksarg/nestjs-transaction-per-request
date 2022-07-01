import { ListQueryOptions } from '@common/common-types.interface.type';
import { PaginatedList } from '@modules/api/common/common.types';
import { RequestContext } from '@modules/api/common/request-context';
import { ListQueryBuilder } from '@modules/common/helpers/list-query-builder';
import { TransactionalConnection } from '@modules/common/services/transactional-connection';
import { Injectable } from '@nestjs/common';
import { FindOptionsUtils } from 'typeorm';
import { GroupEntity } from '../entities/group.entity';

@Injectable()
export class GroupService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
  ) {}
  private readonly relations = ['posts'];
  private readonly groupEntityName = GroupEntity.name.toLocaleLowerCase();

  get(ctx: RequestContext, id): Promise<GroupEntity> {
    const qb = this.connection
      .getRepository(ctx, GroupEntity)
      .createQueryBuilder(this.groupEntityName);

    FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
      relations: this.relations,
    });

    // addJoinsToQueryBuilder(qb, this.joins);
    return qb.where(`${this.groupEntityName}.id = :id`, { id }).getOne();
  }

  findAll(
    ctx: RequestContext,
    options: ListQueryOptions<GroupEntity> | undefined,
  ): Promise<PaginatedList<GroupEntity>> {
    const where = {};

    return this.listQueryBuilder
      .build(GroupEntity, options, {
        ctx,
        where: where,
        relations: this.relations,
      })
      .getManyAndCount()
      .then(([items, totalItems]) => ({ items, totalItems }));
  }
}
