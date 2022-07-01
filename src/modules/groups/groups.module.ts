import { CommonModule } from '@modules/common/common.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './entities/group.entity';
import { GroupService } from './service/group.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity]), CommonModule],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupsModule {}
