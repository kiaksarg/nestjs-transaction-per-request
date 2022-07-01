import { DateOperatorsInput, IdOperatorsInput, StringOperatorsInput } from '../common/common.types';
import { SortOrderEnum } from '@common/constants';
import { ArgsType, Field, ID, InputType } from '@nestjs/graphql';
import { ListQueryInput } from '../common/common.args';

@InputType()
export class PostFilterInput {
  @Field({ nullable: true })
  id: IdOperatorsInput;

  @Field({ nullable: true })
  active: boolean;

  @Field({ nullable: true })
  title: StringOperatorsInput;

  @Field({ nullable: true })
  content: StringOperatorsInput;
}

@InputType()
export class PostSortInput {
  @Field(() => SortOrderEnum, { nullable: true })
  id: SortOrderEnum;

  @Field(() => SortOrderEnum, { nullable: true })
  title: SortOrderEnum;

  @Field(() => DateOperatorsInput, { nullable: true })
  createdAt: DateOperatorsInput;

  @Field(() => DateOperatorsInput, { nullable: true })
  updatedAt: DateOperatorsInput;
}

@InputType()
export class PostListQueryInput extends ListQueryInput<PostSortInput, PostFilterInput>(
  PostSortInput,
  PostFilterInput,
) {}

@ArgsType()
export class PostListQueryOption {
  @Field(() => PostListQueryInput, { nullable: false })
  options: PostListQueryInput;
}

@InputType()
export class PostCreateInput {
  @Field(() => ID, { nullable: true })
  id!: string;

  @Field({ nullable: true })
  title!: string;

  @Field({ nullable: true })
  content!: string;
}
