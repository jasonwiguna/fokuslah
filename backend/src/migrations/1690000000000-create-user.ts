import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // users
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE,
        "total_xp" INT DEFAULT 0,
        "current_streak" INT DEFAULT 0,
        "best_streak" INT DEFAULT 0,
        "last_activity_at" TIMESTAMP,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    // lessons
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    // problems
    await queryRunner.query(`
      CREATE TABLE "problems" (
        "id" SERIAL PRIMARY KEY,
        "lesson_id" INT REFERENCES lessons(id) ON DELETE CASCADE,
        "type" VARCHAR(20) NOT NULL CHECK (type IN ('multiple_choice','input')),
        "question_text" TEXT NOT NULL,
        "correct_answer" TEXT NOT NULL,
        "xp_value" INT DEFAULT 10,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    // problem_options
    await queryRunner.query(`
      CREATE TABLE "problem_options" (
        "id" SERIAL PRIMARY KEY,
        "problem_id" INT REFERENCES problems(id) ON DELETE CASCADE,
        "option_text" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    // submissions
    await queryRunner.query(`
      CREATE TABLE "submissions" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
        "lesson_id" INT REFERENCES lessons(id) ON DELETE CASCADE,
        "attempt_id" UUID UNIQUE NOT NULL,
        "xp_earned" INT DEFAULT 0,
        "submitted_at" TIMESTAMP DEFAULT NOW()
      )
    `);
    // submission_answers
    await queryRunner.query(`
      CREATE TABLE "submission_answers" (
        "id" SERIAL PRIMARY KEY,
        "submission_id" INT REFERENCES submissions(id) ON DELETE CASCADE,
        "problem_id" INT REFERENCES problems(id),
        "user_answer" TEXT NOT NULL,
        "is_correct" BOOLEAN NOT NULL
      )
    `);
    // user_progress
    await queryRunner.query(`
      CREATE TABLE "user_progress" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES users(id) ON DELETE CASCADE,
        "lesson_id" INT REFERENCES lessons(id) ON DELETE CASCADE,
        "problems_completed" INT DEFAULT 0,
        "total_problems" INT NOT NULL,
        "completion_pct" DECIMAL(5,2) DEFAULT 0.00,
        "last_updated" TIMESTAMP DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "submission_answers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "submissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "problem_options"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "problems"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lessons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
