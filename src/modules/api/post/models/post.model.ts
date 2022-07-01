import { Group } from '@modules/api/group/models/group.model';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field({ nullable: false })
  title: string;

  @Field({ nullable: false })
  content: string;

  @Field(() => [Group], { nullable: 'itemsAndList' })
  groups!: Group[];

  @Field()
  active: boolean;
}
