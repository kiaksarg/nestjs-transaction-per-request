/* eslint-disable @typescript-eslint/ban-types */

import { HashidsIdStrategy } from '../../common/services/hashids-id-strategy';
import { Injectable } from '@nestjs/common';

import { IdCodec } from './id-codec';

@Injectable()
export class IdCodecService {
  private idCodec: IdCodec;
  constructor(private entityIdStrategy: HashidsIdStrategy) {
    this.idCodec = new IdCodec(entityIdStrategy);
  }

  encode<T extends string | number | bigint | boolean | object | undefined>(
    target: T,
    transformKeys?: string[],
  ): T {
    return this.idCodec.encode(target, transformKeys);
  }

  decode<T extends string | number | bigint | object | undefined>(
    target: T,
    transformKeys?: string[],
  ): T {
    return this.idCodec.decode(target, transformKeys);
  }
}
