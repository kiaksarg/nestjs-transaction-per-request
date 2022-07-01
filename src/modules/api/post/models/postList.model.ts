import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from './post.model';

@ObjectType({ isAbstract: true })
class PaginatedPostList {
  @Field(() => [Post], { nullable: 'itemsAndList' })
  items: PaginatedPostList[];
  @Field(() => Int)
  totalItems: number;
}

@ObjectType()
export class PostList extends PaginatedPostList {}
