import { IdInterceptor } from './middleware/id-interceptor';
import { CommonModule } from './../common/common.module';
import { IdCodecService } from './common/id-codec.service';
import { HelloResolver } from './hello/hello.resolver';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './middleware/auth-guard';
import { RequestContextService } from './common/request-context.service';
import { PostsModule } from '@modules/posts/posts.module';
import { GroupsModule } from '@modules/groups/groups.module';
import { PostResolver } from './post/post.resolver';
import { GroupResolver } from './group/group.resolver';

@Module({
  imports: [CommonModule, PostsModule, GroupsModule],
  providers: [
    RequestContextService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    HelloResolver,
    IdCodecService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdInterceptor,
    },
    PostResolver,
    GroupResolver,
  ],
  exports: [IdCodecService],
})
export class ApiModule {}
