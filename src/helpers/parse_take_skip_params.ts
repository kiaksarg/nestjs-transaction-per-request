import { ListQueryOptions } from '@common/common-types.interface.type';
import { UserInputError } from 'apollo-server-express';

export const parseTakeSkipParams = (
  options: ListQueryOptions<any>,
): { take: number; skip: number } => {
  const takeLimit = 100;
  if (options.take && options.take > takeLimit) {
    throw new UserInputError('error.list-query-limit-exceeded');
  }
  const skip = Math.max(options.skip ?? 0, 0);
  // `take` must not be negative, and must not be greater than takeLimit
  let take = Math.min(Math.max(options.take ?? 0, 0), takeLimit) || takeLimit;
  if (options.skip !== undefined && options.take === undefined) {
    take = takeLimit;
  }
  return { take, skip };
};
