import { ListQueryOptions } from '@common/common-types.interface.type';
import { PostCreateInput } from '@modules/api/post/post.args';
import { PaginatedList } from '@modules/api/common/common.types';
import { RequestContext } from '@modules/api/common/request-context';
import { ListQueryBuilder } from '@modules/common/helpers/list-query-builder';
import { TransactionalConnection } from '@modules/common/services/transactional-connection';
import { GroupEntity } from '@modules/groups/entities/group.entity';
import { Injectable } from '@nestjs/common';
import { FindOptionsUtils } from 'typeorm';
import { PostEntity } from '../entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
  ) {}
  private readonly relations = ['group'];
  private readonly postEntityName = PostEntity.name.toLocaleLowerCase();

  async create(
    ctx: RequestContext,
    post: PostCreateInput,
    groupName = 'Default Group',
  ): Promise<PostEntity> {
    //Creating a Group
    const defaultGroup = await this.connection
      .getRepository(ctx, GroupEntity)
      .save(new GroupEntity({ name: groupName, description: 'A default group for given post.' }));

    const postEntity = new PostEntity({ ...(post as any), groupId: defaultGroup.id });
    //Making a required field null, to throw an error
    postEntity.testRequiredField = null;

    //Error
    const savedPost = await this.connection.getRepository(ctx, PostEntity).save(postEntity);

    return savedPost;
  }

  get(ctx: RequestContext, id): Promise<PostEntity> {
    const qb = this.connection
      .getRepository(ctx, PostEntity)
      .createQueryBuilder(this.postEntityName);

    FindOptionsUtils.applyFindManyOptionsOrConditionsToQueryBuilder(qb, {
      relations: this.relations,
    });

    // addJoinsToQueryBuilder(qb, this.joins);
    return qb.where(`${this.postEntityName}.id = :id`, { id }).getOne();
  }

  findAll(
    ctx: RequestContext,
    options: ListQueryOptions<PostEntity> | undefined,
  ): Promise<PaginatedList<PostEntity>> {
    const where = {};

    return this.listQueryBuilder
      .build(PostEntity, options, {
        ctx,
        where: where,
        relations: this.relations,
      })
      .getManyAndCount()
      .then(([items, totalItems]) => ({ items, totalItems }));
  }
}
