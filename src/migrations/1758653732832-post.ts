import { MigrationInterface, QueryRunner } from 'typeorm';

export class post1758653732832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
                CREATE TABLE IF NOT EXISTS public.post
                (
                    id integer NOT NULL DEFAULT nextval('post_id_seq'::regclass),
                    title character varying COLLATE pg_catalog."default" NOT NULL,
                    text character varying COLLATE pg_catalog."default" NOT NULL,
                    "creatorId" integer NOT NULL,
                    points integer NOT NULL DEFAULT 0,
                    "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
                    "updatedAt" timestamp without time zone NOT NULL DEFAULT now(),
                    "voteStatus" integer NOT NULL DEFAULT 0,
                    CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY (id),
                    CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId")
                        REFERENCES public."user" (id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                )
            `
    );
  }
}
