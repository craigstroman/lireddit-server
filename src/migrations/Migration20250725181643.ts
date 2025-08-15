import { Migration } from '@mikro-orm/migrations';

export class Migration20250725181643 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, first_name text not null, last_name text not null, email text not null, "username" text not null, "password" text not null);'
    );
    this.addSql(
      'alter table "user" add constraint "user_username_unique" unique ("username");'
    );
    this.addSql(
      'alter table "user" add constraint "user_email_unique" unique ("email");'
    );
  }

  override async down(): Promise<void> {}
}
