import {MigrationInterface, QueryRunner} from "typeorm";

export class init1656597444085 implements MigrationInterface {
    name = 'init1656597444085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "posts" ("created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "active" boolean NOT NULL DEFAULT (1), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "content" text, "test_required_field" integer NOT NULL, "group_id" integer NOT NULL)`);
        await queryRunner.query(`CREATE INDEX "IDX_af95ddf25e9bd491236781b1ae" ON "posts" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_72af15d4745203c77905a7ab2a" ON "posts" ("content") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b668587d0148fb268da2ca3c7" ON "posts" ("test_required_field") `);
        await queryRunner.query(`CREATE TABLE "groups" ("created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "active" boolean NOT NULL DEFAULT (1), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text)`);
        await queryRunner.query(`CREATE INDEX "IDX_664ea405ae2a10c264d582ee56" ON "groups" ("name") `);
        await queryRunner.query(`DROP INDEX "IDX_af95ddf25e9bd491236781b1ae"`);
        await queryRunner.query(`DROP INDEX "IDX_72af15d4745203c77905a7ab2a"`);
        await queryRunner.query(`DROP INDEX "IDX_3b668587d0148fb268da2ca3c7"`);
        await queryRunner.query(`CREATE TABLE "temporary_posts" ("created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "active" boolean NOT NULL DEFAULT (1), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "content" text, "test_required_field" integer NOT NULL, "group_id" integer NOT NULL, CONSTRAINT "FK_7628aa3741a30d6217271a226cf" FOREIGN KEY ("group_id") REFERENCES "groups" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_posts"("created_at", "updated_at", "active", "id", "name", "content", "test_required_field", "group_id") SELECT "created_at", "updated_at", "active", "id", "name", "content", "test_required_field", "group_id" FROM "posts"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`ALTER TABLE "temporary_posts" RENAME TO "posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_af95ddf25e9bd491236781b1ae" ON "posts" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_72af15d4745203c77905a7ab2a" ON "posts" ("content") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b668587d0148fb268da2ca3c7" ON "posts" ("test_required_field") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_3b668587d0148fb268da2ca3c7"`);
        await queryRunner.query(`DROP INDEX "IDX_72af15d4745203c77905a7ab2a"`);
        await queryRunner.query(`DROP INDEX "IDX_af95ddf25e9bd491236781b1ae"`);
        await queryRunner.query(`ALTER TABLE "posts" RENAME TO "temporary_posts"`);
        await queryRunner.query(`CREATE TABLE "posts" ("created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "active" boolean NOT NULL DEFAULT (1), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "content" text, "test_required_field" integer NOT NULL, "group_id" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "posts"("created_at", "updated_at", "active", "id", "name", "content", "test_required_field", "group_id") SELECT "created_at", "updated_at", "active", "id", "name", "content", "test_required_field", "group_id" FROM "temporary_posts"`);
        await queryRunner.query(`DROP TABLE "temporary_posts"`);
        await queryRunner.query(`CREATE INDEX "IDX_3b668587d0148fb268da2ca3c7" ON "posts" ("test_required_field") `);
        await queryRunner.query(`CREATE INDEX "IDX_72af15d4745203c77905a7ab2a" ON "posts" ("content") `);
        await queryRunner.query(`CREATE INDEX "IDX_af95ddf25e9bd491236781b1ae" ON "posts" ("name") `);
        await queryRunner.query(`DROP INDEX "IDX_664ea405ae2a10c264d582ee56"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP INDEX "IDX_3b668587d0148fb268da2ca3c7"`);
        await queryRunner.query(`DROP INDEX "IDX_72af15d4745203c77905a7ab2a"`);
        await queryRunner.query(`DROP INDEX "IDX_af95ddf25e9bd491236781b1ae"`);
        await queryRunner.query(`DROP TABLE "posts"`);
    }

}
