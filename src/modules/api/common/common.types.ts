import { Int, Field, ObjectType, NullableList, InputType, ID } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { GraphQLDateTime } from 'graphql-scalars';

export type PaginatedList<T> = {
  items: T[];
  totalItems: number;
};

export function Paginated<T>(classRef: Type<T>, nullable: boolean | NullableList): any {
  @ObjectType({ isAbstract: true })
  class PaginatedList<T> {
    @Field(() => [classRef], { nullable: nullable })
    items: T[];
    @Field(() => Int)
    totalItems: number;
  }
  return PaginatedList;
}

@InputType()
export class StringOperatorsInput {
  @Field({ nullable: true })
  eq?: string;
  @Field({ nullable: true })
  notEq?: string;
  @Field({ nullable: true })
  contains?: string;
  @Field({ nullable: true })
  notContains?: string;
  @Field({ nullable: true })
  search?: string;
  @Field(() => [String], { nullable: true })
  in?: string[];
  @Field(() => [String], { nullable: true })
  notIn?: string[];
  @Field({ nullable: true })
  regex?: string;
}
@InputType()
export class IdOperatorsInput {
  @Field(() => ID, { nullable: true })
  eq?: string;
  @Field(() => ID, { nullable: true })
  notEq?: string;
  @Field(() => [ID], { nullable: true })
  in?: string[];
  @Field(() => [ID], { nullable: true })
  notIn?: string[];
}

@InputType()
export class BooleanOperatorsInput {
  @Field({ nullable: true })
  eq?: boolean;
}

@InputType()
export class NumberRangeInput {
  @Field(() => Int)
  start: number;
  @Field(() => Int)
  end: number;
}

@InputType()
export class NumberOperatorsInput {
  @Field(() => Int, { nullable: true })
  eq?: number;
  @Field(() => Int, { nullable: true })
  lt?: number;
  @Field(() => Int, { nullable: true })
  lte?: number;
  @Field(() => Int, { nullable: true })
  gt?: number;
  @Field(() => Int, { nullable: true })
  gte?: number;
  @Field(() => NumberRangeInput, { nullable: true })
  between?: NumberRangeInput;
}

@InputType()
export class DateRangeInput {
  @Field(() => GraphQLDateTime)
  start: Date;
  @Field(() => GraphQLDateTime)
  end: Date;
}

@InputType()
export class DateOperatorsInput {
  @Field(() => GraphQLDateTime, { nullable: true })
  eq?: Date;
  @Field(() => GraphQLDateTime, { nullable: true })
  before?: Date;
  @Field(() => GraphQLDateTime, { nullable: true })
  after?: Date;
  @Field(() => DateRangeInput, { nullable: true })
  between?: DateRangeInput;
}
