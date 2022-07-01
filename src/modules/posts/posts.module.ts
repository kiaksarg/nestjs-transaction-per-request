import { CommonModule } from '@modules/common/common.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './entities/post.entity';
import { PostService } from './service/post.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostEntity]), CommonModule],
  providers: [PostService],
  exports: [PostService],
})
export class PostsModule {}
