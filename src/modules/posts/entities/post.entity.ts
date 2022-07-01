import { BaseEntity } from '../../common/entities';
import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { classToPlain } from 'class-transformer';
import { GroupEntity } from '@modules/groups/entities/group.entity';

@Entity({ name: 'posts' })
export class PostEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'id',
    type: 'integer',
  })
  id: number;

  @Index({ fulltext: true })
  @Column({
    name: 'name',
    type: 'varchar',
  })
  title: string;

  @Index({ fulltext: true })
  @Column({
    name: 'content',
    type: 'text',
    nullable: true,
  })
  content!: string;

  @Index({ fulltext: true })
  @Column({
    name: 'test_required_field',
    type: 'integer',
  })
  testRequiredField: string;

  @Column({
    name: 'group_id',
    type: 'integer',
  })
  groupId: number;

  @ManyToOne(() => GroupEntity, (group) => group.posts, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;

  toJSON() {
    return classToPlain(this);
  }

  // Constructor
  constructor(post?: Partial<PostEntity>) {
    super();
    Object.assign(this, post);
  }
}
