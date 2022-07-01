import { ApolloError } from 'apollo-server-core';

/**
 * @description
 * This error should be thrown when user input is not as expected.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class UserInputError extends ApolloError {
  constructor(message: string) {
    super(message, 'USER_INPUT_ERROR');
  }
}

/**
 * @description
 * This error should be thrown when some unexpected and exceptional case is encountered.
 *
 * @docsCategory errors
 * @docsPage Error Types
 */
export class InternalServerError extends ApolloError {
  constructor(message: string) {
    super(message, 'INTERNAL_SERVER_ERROR');
  }
}
