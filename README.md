# transaction-per-request
Nestjs Transaction per request

![transaction-per-request](https://user-images.githubusercontent.com/13861835/176965621-25e27d41-6e45-46ee-8c28-c805683ac8fd.gif)

## [post.service.ts](https://github.com/kiaksarg/nestJs-transaction-per-request/blob/2da00a0550875abc96584248842721cd6cede2c9/src/modules/posts/service/post.service.ts#L21)

```
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
```


## [post.resolver.ts](https://github.com/kiaksarg/nestJs-transaction-per-request/blob/2da00a0550875abc96584248842721cd6cede2c9/src/modules/api/post/post.resolver.ts#L32)
```
  @Transaction()
  @Mutation(() => Post)
  async createPostTransactional(
    @Ctx() ctx: RequestContext,
    @Args('postCreateInput') postCreateInput: PostCreateInput,
  ) {
    return await this.postService.create(ctx, postCreateInput, 'Transactional Group Name');
  }
```
