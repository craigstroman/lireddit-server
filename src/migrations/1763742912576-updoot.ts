import { MigrationInterface, QueryRunner } from 'typeorm';

export class updoot1758653918901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
                CREATE TABLE IF NOT EXISTS public.updoot
                (
                    value integer NOT NULL,
                    "userId" integer NOT NULL,
                    "postId" integer NOT NULL,
                    CONSTRAINT "PK_6476d7e464bcb8571004134515c" PRIMARY KEY ("userId", "postId"),
                    CONSTRAINT "FK_9df9e319a273ad45ce509cf2f68" FOREIGN KEY ("userId")
                        REFERENCES public."user" (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION,
                    CONSTRAINT "FK_fd6b77bfdf9eae6691170bc9cb5" FOREIGN KEY ("postId")
                        REFERENCES public.post (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                )
            `
    );
  }
}
