import { EntityIdStrategy } from './entity-id-strategy';

/**
 * @description
 * An id strategy which uses auto-increment integers as primary keys
 * for all entities. This is the default strategy used by nestjs-transaction-per-request.
 *
 * @docsCategory configuration
 * @docsPage EntityIdStrategy
 */
export class AutoIncrementIdStrategy implements EntityIdStrategy<'increment'> {
  readonly primaryKeyType = 'increment';
  decodeId(id: string): bigint {
    const asNumber = +id;
    return Number.isNaN(asNumber) ? BigInt(-1) : BigInt(asNumber);
  }
  encodeId(primaryKey: bigint): string {
    return primaryKey.toString();
  }
}
