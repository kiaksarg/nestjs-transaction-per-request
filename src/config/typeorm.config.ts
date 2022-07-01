import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

const root: string = path.resolve(__dirname, '..');

/**
 * Setup default connection in the application
 * @param config {ConfigService}
 */
// export const mariadbConnection = (config: ConfigService): TypeOrmModuleOptions => {
//   return {
//     name: 'default',
//     type: 'mariadb',
//     host: config.get('DATABASE_HOST') || 'host.docker.internal',
//     port: Number(config.get('DATABASE_PORT')) || 3306,
//     username: config.get('DATABASE_USER') || 'lotr',
//     password: config.get('DATABASE_PASSWORD') || '@LotrPass',
//     database: config.get('DATABASE_NAME') || 'gql_lotr_db',
//     synchronize: false,
//     dropSchema: false,
//     logging: config.get('MODE') == 'DEV',
//     logger: 'file',
//     entities: ['dist/**/*.entity.js'],
//     migrations: ['dist/migration/**/*.{.ts,.js}'],
//     subscribers: ['dist/subscriber/**/*.js'],
//     migrationsTableName: 'migration',
//     migrationsRun: config.get('RUN_MIGRATIONS'),
//     cli: {
//       migrationsDir: 'src/database/migration',
//     },
//     ssl: false, // config.get('MODE') != 'DEV',
//   };
// };

export const defaultConnection = (config: ConfigService): TypeOrmModuleOptions => ({
  name: 'default',
  type: 'sqlite',
  database: `dist/data/${config.get('DATABASE_NAME')}.sqlite`,
  synchronize: false,
  dropSchema: false,
  logging: config.get('MODE') == 'DEV',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/sqlite/migration/**/*.js'],
  migrationsTableName: 'migration',
  migrationsRun: config.get('RUN_MIGRATIONS'),
  cli: {
    migrationsDir: 'src/database/sqlite/migration',
  },
  ssl: false, //config.get('MODE') != 'DEV',
});

export default defaultConnection;
