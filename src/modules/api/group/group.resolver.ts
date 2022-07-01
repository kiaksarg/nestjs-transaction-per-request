import { GroupService } from '@modules/groups/service/group.service';
import { NotFoundException } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../common/request-context';
import { Ctx } from '../decorators/request-context.decorator';
import { GroupListQueryOption } from './group.args';
import { Group } from './models/group.model';
import { GroupList } from './models/groupList.model';

@Resolver(() => Group)
export class GroupResolver {
  constructor(private groupService: GroupService) {}

  @Query(() => Group, { name: 'groups' })
  async getGroup(@Ctx() ctx: RequestContext, @Args('id', { type: () => ID }) id: bigint) {
    const group = await this.groupService.get(ctx, id);

    if (!group) {
      throw new NotFoundException(id);
    }
    return group;
  }

  @Query(() => GroupList)
  async groups(@Ctx() ctx: RequestContext, @Args() args: GroupListQueryOption) {
    return this.groupService.findAll(ctx, args.options);
  }
}
