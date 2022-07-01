import { ConfigService, ConfigModule } from '@nestjs/config';
import { HashidsIdStrategy } from './services/hashids-id-strategy';
import { HashidsService } from './services/hashids';
import { ListQueryBuilder } from './helpers/list-query-builder';
import { Module } from '@nestjs/common';
import { TransactionalConnection } from './services/transactional-connection';

@Module({
  imports: [ConfigModule],
  providers: [
    TransactionalConnection,
    ListQueryBuilder,
    HashidsIdStrategy,
    {
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new HashidsService(configService.get('SALT_ID'), 12);
      },
      provide: HashidsService,
    },
  ],
  exports: [TransactionalConnection, ListQueryBuilder, HashidsIdStrategy, HashidsService],
})
export class CommonModule {}
