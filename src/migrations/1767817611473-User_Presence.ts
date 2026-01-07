import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPresence1767817611473 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    `
                CREATE TABLE IF NOT EXISTS public.user_presence
                (
                    user_id UUID PRIMARY KEY REFERENCES users(id),
                    is_online BOOLEAN NOT NULL DEFAULT FALSE,
                    connection_count INT NOT NULL DEFAULT 0,
                    last_seen_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    last_online_at TIMESTAMP NULL,
                    last_offline_at TIMESTAMP NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
            `;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
