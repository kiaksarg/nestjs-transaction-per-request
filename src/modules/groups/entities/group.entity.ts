import { BaseEntity } from '../../common/entities';
import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { classToPlain } from 'class-transformer';
import { PostEntity } from '@modules/posts/entities/post.entity';

@Entity({ name: 'groups' })
export class GroupEntity extends BaseEntity {
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
  name: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description!: string;

  @OneToMany(() => PostEntity, (post) => post.group)
  public posts!: PostEntity[];

  toJSON() {
    return classToPlain(this);
  }

  // Constructor
  constructor(group?: Partial<GroupEntity>) {
    super();
    Object.assign(this, group);
  }
}
