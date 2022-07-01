import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Group } from './group.model';

@ObjectType({ isAbstract: true })
class PaginatedGroupList {
  @Field(() => [Group], { nullable: 'itemsAndList' })
  items: PaginatedGroupList[];
  @Field(() => Int)
  totalItems: number;
}

@ObjectType()
export class GroupList extends PaginatedGroupList {}
