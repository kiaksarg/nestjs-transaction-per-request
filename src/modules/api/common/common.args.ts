import { Type } from '@nestjs/common';
import { Field, Int, ID, InputType } from '@nestjs/graphql';
import { IsNumber, Min, Max, IsOptional } from 'class-validator';
import { CannotWith } from '@common/validators/cannot-with.validator';
import { OperatorEnum } from '@common/constants';

// export function ListArgs<SortType, FilterType>(
//   sortRef: Type<SortType>,
//   filterRef: Type<FilterType>,
// ): any {
//   @ArgsType()
//   class ListArguments {
//     @Field(() => Int, { nullable: true })
//     @CannotWith(['after'])
//     @IsOptional()
//     @IsNumber()
//     @Min(0)
//     skip?: number;

//     @Field(() => Int)
//     @IsNumber()
//     @Min(1)
//     @Max(100)
//     take: number;

//     @Field(() => ID, {
//       nullable: true,
//       description: 'Works only with sort by id',
//     })
//     @CannotWith(['skip', 'before'])
//     after?: string;

//     @Field(() => ID, {
//       nullable: true,
//       description: 'Works only with sort order by id',
//     })
//     @CannotWith(['after', 'skip'])
//     before?: string;

//     @Field(() => OperatorEnum, { nullable: true })
//     operator?: OperatorEnum;

//     @Field(() => sortRef, { nullable: true })
//     sort?: SortType;

//     @Field(() => filterRef, { nullable: true })
//     filter?: FilterType;
//   }

//   return ListArguments;
// }

export function ListQueryInput<SortType, FilterType>(
  sortRef: Type<SortType>,
  filterRef: Type<FilterType>,
): any {
  @InputType()
  class PageListInp {
    @Field(() => Int, { nullable: true })
    @CannotWith(['after'])
    @IsOptional()
    @IsNumber()
    @Min(0)
    skip?: number;

    @Field(() => Int)
    @IsNumber()
    @Min(1)
    @Max(100)
    take: number;

    @Field(() => ID, {
      nullable: true,
      description: 'Works only with sort by id',
    })
    @CannotWith(['skip', 'before'])
    after?: string;

    @Field(() => ID, {
      nullable: true,
      description: 'Works only with sort order by id',
    })
    @CannotWith(['after', 'skip'])
    before?: string;

    @Field(() => OperatorEnum, { nullable: true })
    operator?: OperatorEnum;

    @Field(() => sortRef, { nullable: true })
    sort?: SortType;

    @Field(() => filterRef, { nullable: true })
    filter?: FilterType;

    @Field({
      nullable: true,
      description: 'a random text to reset the request.',
    })
    timestamp?: string;
  }

  return PageListInp;
}
