import { Post } from '@modules/api/post/models/post.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Group {
  @Field(() => ID)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => [Post], { nullable: 'itemsAndList' })
  locations!: Post[];

  @Field()
  active: boolean;
}
