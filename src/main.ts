import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setBigNumberPostgresTypeParser } from './common/postgres-typeParsers';

setBigNumberPostgresTypeParser();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.APP_PORT || 4000);
}
bootstrap();
