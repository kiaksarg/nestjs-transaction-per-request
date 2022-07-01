import { IdCodecService } from './modules/api/common/id-codec.service';
import { IdCodecPlugin } from './modules/api/middleware/id-codec-plugin';
import { ApiModule } from './modules/api/api.module';
import { join } from 'path';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { defaultConnection } from './config/typeorm.config';
// import { sqliteConnection } from './config/typeorm.config';
import { GraphQLModule } from '@nestjs/graphql';
import { CommonModule } from '@modules/common/common.module';
// import connectionOptions from './config/orm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    GraphQLModule.forRootAsync({
      imports: [ConfigModule, ApiModule],
      inject: [ConfigService, IdCodecService],
      useFactory: async (configService: ConfigService, idCodecService: IdCodecService) => ({
        playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
        autoSchemaFile: join(process.cwd(), 'src/modules/api/schema.gql'),
        plugins: [new IdCodecPlugin(idCodecService)],
        // tracing: true,
        // installSubscriptionHandlers: true,
      }),
    }),
    // TypeOrmModule.forRoot(connectionOptions),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: defaultConnection,
      // useFactory: sqliteConnection,
      inject: [ConfigService],
    }),
    ApiModule,
    CommonModule,
  ],
  controllers: [],
})
export class AppModule {}
