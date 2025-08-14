import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Lesson } from '../entities/lesson.entity';
import { UserProgress } from '../entities/user_progress.entity';
import { Problem } from '../entities/problem.entity';
import { Submission } from '../entities/submission.entity';
import { SubmissionAnswer } from '../entities/submission_answer.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private lessonsRepo: Repository<Lesson>,
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
  ) {}

  async getLessonsWithProgress(userId: number) {
    const lessons = await this.lessonsRepo.find();
    const progress = await this.progressRepo.find({ where: { user_id: userId } });
    const progressMap = new Map(progress.map(p => [p.lesson_id, p]));
    return lessons.map(lesson => ({
      ...lesson,
      progress: progressMap.get(lesson.id) || null,
    }));
  }

  async getLessonWithProblems(lessonId: number) {
    const lesson = await this.lessonsRepo.findOne({ where: { id: lessonId } });
    if (!lesson) return null;
    const problemRepo = this.lessonsRepo.manager.getRepository(Problem);
    const optionRepo = this.lessonsRepo.manager.getRepository('problem_options');
    const problems = await problemRepo.find({ where: { lesson_id: lessonId } });

    const safeProblems = await Promise.all(
      problems.map(async ({ correct_answer, ...rest }) => {
        let options: { id: number; option_text: string }[] = [];
        if (rest.type === 'multiple_choice') {
          const dbOptions = await optionRepo.find({ where: { problem_id: rest.id } });
          options = dbOptions.map((opt: any) => ({ id: opt.id, option_text: opt.option_text }));
        }
        return { ...rest, options: options.length > 0 ? options : undefined };
      })
    );

    return { ...lesson, problems: safeProblems };
  }

  async submitLesson(
    userId: number,
    lessonId: number,
    attemptId: string,
    answers: { problem_id: number; answer: string }[]
  ) {
    return await this.lessonsRepo.manager.transaction(async (manager) => {
      const submissionRepo = manager.getRepository(Submission);
      const problemRepo = manager.getRepository(Problem);
      const answerRepo = manager.getRepository(SubmissionAnswer);
      const userRepo = manager.getRepository(User);
      const progressRepo = manager.getRepository(UserProgress);

      // 1. Idempotency check
      const existing = await submissionRepo.findOne({ where: { attempt_id: attemptId } });
      if (existing) {
        return this._buildSubmissionResult(userId, lessonId, existing.id, manager);
      }

      // 2. Create submission
      const submission = submissionRepo.create({
        user_id: userId,
        lesson_id: lessonId,
        attempt_id: attemptId,
        xp_earned: 0,
      });
      await submissionRepo.save(submission);

      // 3. Grade answers & prevent XP farming
      let xpEarned = 0;
      const problems = await problemRepo.find({ where: { lesson_id: lessonId } });

      for (const ans of answers) {
        const problem = problems.find((p) => p.id === ans.problem_id);
        if (!problem) continue;

        const isCorrect = problem.correct_answer.trim() === ans.answer.trim();
        let awardXP = false;

        if (isCorrect) {
          const alreadyCorrect = await answerRepo
            .createQueryBuilder('sa')
            .innerJoin('sa.submission', 's')
            .where('s.user_id = :userId', { userId })
            .andWhere('sa.problem_id = :problemId', { problemId: problem.id })
            .andWhere('sa.is_correct = true')
            .getCount();

          if (alreadyCorrect === 0) {
            awardXP = true;
            xpEarned += problem.xp_value;
          }
        }

        await answerRepo.save(
          answerRepo.create({
            submission_id: submission.id,
            problem_id: ans.problem_id,
            user_answer: ans.answer,
            is_correct: isCorrect,
          })
        );

        // 4. Update progress if newly mastered
        if (isCorrect && awardXP) {
          let progress = await progressRepo.findOne({
            where: { user_id: userId, lesson_id: lessonId },
          });

          if (!progress) {
            progress = progressRepo.create({
              user_id: userId,
              lesson_id: lessonId,
              problems_completed: 1,
              total_problems: problems.length,
              completion_pct: (1 / problems.length) * 100,
            });
          } else {
            progress.problems_completed += 1;
            progress.completion_pct = (progress.problems_completed / problems.length) * 100;
          }

          progress.last_updated = new Date();
          await progressRepo.save(progress);
        }
      }

      // 5. Save XP earned
      submission.xp_earned = xpEarned;
      await submissionRepo.save(submission);

      // 6. Update XP & streak
      const user = await userRepo.findOne({ where: { id: userId } });
      if (user) {
        user.total_xp += xpEarned;

        const todayUTC = new Date().toISOString().slice(0, 10);
        const lastActivityDay = user.last_activity_at
          ? user.last_activity_at.toISOString().slice(0, 10)
          : null;

        if (!lastActivityDay || todayUTC > lastActivityDay) {
          const yesterday = new Date();
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);
          const yesterdayUTC = yesterday.toISOString().slice(0, 10);

          if (lastActivityDay === yesterdayUTC) {
            user.current_streak += 1;
          } else {
            user.current_streak = 1;
          }

          if (user.current_streak > user.best_streak) {
            user.best_streak = user.current_streak;
          }
        }

        user.last_activity_at = new Date();
        await userRepo.save(user);
      }

      return this._buildSubmissionResult(userId, lessonId, submission.id, manager);
    });
  }

  private async _buildSubmissionResult(
    userId: number,
    lessonId: number,
    submissionId: number,
    manager: EntityManager
  ) {
    const submissionRepo = manager.getRepository(Submission);
    const userRepo = manager.getRepository(User);
    const progressRepo = manager.getRepository(UserProgress);

    const submission = await submissionRepo.findOne({
      where: { id: submissionId },
    });

    const user = await userRepo.findOne({
      where: { id: userId },
    });

    const progress = await progressRepo.findOne({
      where: { user_id: userId, lesson_id: lessonId },
    });

    return {
      xp_earned: submission?.xp_earned || 0,
      current_streak: user?.current_streak || 0,
      best_streak: user?.best_streak || 0,
      progress: progress || {
        problems_completed: 0,
        total_problems: 0,
        completion_pct: 0,
      },
    };
  }
}
