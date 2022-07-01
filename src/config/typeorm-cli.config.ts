import { ConnectionOptions } from 'typeorm';
// import * as path from 'path';

// const root: string = path.resolve(__dirname, '..');

const config = {
  db: process.env.DB,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  logging: process.env.MODE == 'DEV',
  migrationsRun: Boolean(process.env.RUN_MIGRATIONS),
  ssl: false, // process.env.MODE == 'PROD',
};

// const connectionOptions: ConnectionOptions = {
//   type: config.db as 'mariadb',
//   host: config.host,
//   port: Number(config.port),
//   username: config.username || 'mariadb',
//   password: config.password || 'mariadb',
//   database: config.database || 'gql_lotr_db',
//   entities: ['src/modules/**/*.entity.{ts,js}'],
//   // We are using migrations, synchronize should be set to false.
//   synchronize: false,
//   dropSchema: false,
//   // Run migrations automatically,
//   // you can disable this if you prefer running migration manually.
//   migrationsRun: config.migrationsRun,
//   migrationsTableName: 'migration',
//   logging: config.logging,
//   migrations: ['src/database/migration/*.ts'],
//   cli: {
//     migrationsDir: 'src/database/migration',
//     entitiesDir: 'src/modules',
//   },
//   ssl: config.ssl,
// };

const connectionOptions: ConnectionOptions = {
  type: 'sqlite',
  database: `dist/data/${config.database}.sqlite`,
  // database: `${root}/data/${config.database}.sqlite`,
  entities: ['src/modules/**/*.entity.{ts,js}'],
  // We are using migrations, synchronize should be set to false.
  synchronize: false,
  dropSchema: false,
  // Run migrations automatically,
  // you can disable this if you prefer running migration manually.
  migrationsRun: config.migrationsRun,
  migrationsTableName: 'migration',
  logging: config.logging,
  migrations: ['src/database/sqlite/migration/*.ts'],
  cli: {
    migrationsDir: 'src/database/sqlite/migration',
    entitiesDir: 'src/modules',
  },
  // ssl: config.ssl,
};

export = connectionOptions;
// export = sqliteConnectionOptions;
