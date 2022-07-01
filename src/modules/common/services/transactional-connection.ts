// tslint:disable-next-line:no-non-null-assertion
import { RequestContext } from './../../api/common/request-context';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
  Connection,
  EntityManager,
  EntitySchema,
  getRepository,
  ObjectType,
  Repository,
} from 'typeorm';

import { TRANSACTION_MANAGER_KEY } from './../../../common/constants';

/**
 * @description
 * The TransactionalConnection is a wrapper around the TypeORM `Connection` object which works in conjunction
 * with the {@link Transaction} decorator to implement per-request transactions. All services which access the
 * database should use this class rather than the raw TypeORM connection, to ensure that db changes can be
 * easily wrapped in transactions when required.
 *
 * The service layer does not need to know about the scope of a transaction, as this is covered at the
 * API by the use of the `Transaction` decorator.
 *
 * @docsCategory data-access
 */
@Injectable()
export class TransactionalConnection {
  constructor(@InjectConnection() private connection: Connection) {}

  /**
   * @description
   * The plain TypeORM Connection object. Should be used carefully as any operations
   * performed with this connection will not be performed within any outer
   * transactions.
   */
  get rawConnection(): Connection {
    return this.connection;
  }

  /**
   * @description
   * Returns a TypeORM repository. Note that when no RequestContext is supplied, the repository will not
   * be aware of any existing transaction. Therefore calling this method without supplying a RequestContext
   * is discouraged without a deliberate reason.
   */
  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity>;
  /**
   * @description
   * Returns a TypeORM repository which is bound to any existing transactions. It is recommended to _always_ pass
   * the RequestContext argument when possible, otherwise the queries will be executed outside of any
   * ongoing transactions which have been started by the {@link Transaction} decorator.
   */
  getRepository<Entity>(
    ctx: RequestContext | undefined,
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity>;
  getRepository<Entity>(
    ctxOrTarget: RequestContext | ObjectType<Entity> | EntitySchema<Entity> | string | undefined,
    maybeTarget?: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity> {
    if (ctxOrTarget instanceof RequestContext) {
      const transactionManager = this.getTransactionManager(ctxOrTarget);
      if (transactionManager && maybeTarget && !transactionManager.queryRunner?.isReleased) {
        return transactionManager.getRepository(maybeTarget);
      } else {
        return getRepository(maybeTarget!);
      }
    } else {
      return getRepository(ctxOrTarget ?? maybeTarget!);
    }
  }

  /**
   * @description
   * Manually start a transaction if one is not already in progress. This method should be used in
   * conjunction with the `'manual'` mode of the {@link Transaction} decorator.
   */
  async startTransaction(ctx: RequestContext) {
    const transactionManager = this.getTransactionManager(ctx);
    if (transactionManager?.queryRunner?.isTransactionActive === false) {
      await transactionManager.queryRunner.startTransaction();
    }
  }

  /**
   * @description
   * Manually commits any open transaction. Should be very rarely needed, since the {@link Transaction} decorator
   * and the internal TransactionInterceptor take care of this automatically. Use-cases include situations
   * in which the worker thread needs to access changes made in the current transaction, or when using the
   * Transaction decorator in manual mode.
   */
  async commitOpenTransaction(ctx: RequestContext) {
    const transactionManager = this.getTransactionManager(ctx);
    if (transactionManager?.queryRunner?.isTransactionActive) {
      await transactionManager.queryRunner.commitTransaction();
    }
  }

  /**
   * @description
   * Manually rolls back any open transaction. Should be very rarely needed, since the {@link Transaction} decorator
   * and the internal TransactionInterceptor take care of this automatically. Use-cases include when using the
   * Transaction decorator in manual mode.
   */
  async rollBackTransaction(ctx: RequestContext) {
    const transactionManager = this.getTransactionManager(ctx);
    if (transactionManager?.queryRunner?.isTransactionActive) {
      await transactionManager.queryRunner.rollbackTransaction();
    }
  }

  private getTransactionManager(ctx: RequestContext): EntityManager | undefined {
    return (ctx as any)[TRANSACTION_MANAGER_KEY];
  }
}
