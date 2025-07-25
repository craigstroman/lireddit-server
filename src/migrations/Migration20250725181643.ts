import { Migration } from '@mikro-orm/migrations';

export class Migration20250725181643 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "created_at" date not null default 'Fri Jul 25 2025 14:16:43 GMT-0400 (Eastern Daylight Time)', "updated_at" date not null default 'Fri Jul 25 2025 14:16:43 GMT-0400 (Eastern Daylight Time)', "username" text not null, "password" text not null);`);
    this.addSql(`alter table "user" add constraint "user_username_unique" unique ("username");`);

    this.addSql(`alter table "post" alter column "created_at" type date using ("created_at"::date);`);
    this.addSql(`alter table "post" alter column "created_at" set default 'Fri Jul 25 2025 14:16:43 GMT-0400 (Eastern Daylight Time)';`);
    this.addSql(`alter table "post" alter column "updated_at" type date using ("updated_at"::date);`);
    this.addSql(`alter table "post" alter column "updated_at" set default 'Fri Jul 25 2025 14:16:43 GMT-0400 (Eastern Daylight Time)';`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`alter table "post" alter column "created_at" drop default;`);
    this.addSql(`alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));`);
    this.addSql(`alter table "post" alter column "updated_at" drop default;`);
    this.addSql(`alter table "post" alter column "updated_at" type timestamptz(0) using ("updated_at"::timestamptz(0));`);
  }

}
