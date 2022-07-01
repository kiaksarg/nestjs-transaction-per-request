import { HashidsService } from './hashids';
import { Injectable } from '@nestjs/common';
import { EntityIdStrategy } from '../../../config/entity-id-strategy/entity-id-strategy';
/**
 * An example custom strategy which uses base64 encoding on integer ids.
 */
@Injectable()
export class HashidsIdStrategy implements EntityIdStrategy<'hashids'> {
  constructor(private hashids: HashidsService) {}
  readonly primaryKeyType = 'hashids';
  decodeId(id: string): bigint {
    return BigInt(this.hashids.decode(id));
  }
  encodeId(primaryKey: bigint): string {
    return this.hashids.encode(primaryKey);
  }
}
