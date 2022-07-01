import { PostService } from '@modules/posts/service/post.service';
import { NotFoundException } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { RequestContext } from '../common/request-context';
import { Ctx } from '../decorators/request-context.decorator';
import { PostCreateInput, PostListQueryOption } from './post.args';
import { Post } from './models/post.model';
import { PostList } from './models/postList.model';
import { Transaction } from '../decorators/transaction.decorator';

@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostService) {}

  @Query(() => Post, { name: 'post' })
  async getPost(@Ctx() ctx: RequestContext, @Args('id', { type: () => ID }) id: bigint) {
    const post = await this.postService.get(ctx, id);

    if (!post) {
      throw new NotFoundException(id);
    }
    return post;
  }

  @Query(() => PostList)
  async posts(@Ctx() ctx: RequestContext, @Args() args: PostListQueryOption) {
    return this.postService.findAll(ctx, args.options);
  }

  @Transaction()
  @Mutation(() => Post)
  async createPostTransactional(
    @Ctx() ctx: RequestContext,
    @Args('postCreateInput') postCreateInput: PostCreateInput,
  ) {
    return await this.postService.create(ctx, postCreateInput, 'Transactional Group Name');
  }

  @Mutation(() => Post)
  async createPostWithoutTransaction(
    @Ctx() ctx: RequestContext,
    @Args('postCreateInput') postCreateInput: PostCreateInput,
  ) {
    return await this.postService.create(ctx, postCreateInput, 'Not Transactional Group Name');
  }
}
