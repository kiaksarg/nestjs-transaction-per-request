import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// const dbType = process.env.DB;

export abstract class BaseEntity {
  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    nullable: false,
  })
  updatedAt: Date;

  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;
}
