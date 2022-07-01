import { EntityIdStrategy } from './entity-id-strategy';

/**
 * An example custom strategy which uses base64 encoding on integer ids.
 */
export class Base64IdStrategy implements EntityIdStrategy<'increment'> {
  readonly primaryKeyType = 'increment';
  decodeId(id: string): bigint {
    const asNumber = BigInt(+Buffer.from(id, 'base64').toString());
    return Number.isNaN(asNumber) ? BigInt(-1) : asNumber;
  }
  encodeId(primaryKey: bigint): string {
    return Buffer.from(primaryKey.toString())
      .toString('base64')
      .replace(/=+$/, '');
  }
}
