import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProgress } from '../entities/user_progress.entity';
import { Lesson } from '../entities/lesson.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepo: Repository<UserProgress>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    // Get all lessons
    const lessonRepo = this.userRepo.manager.getRepository(Lesson);
    const allLessons = await lessonRepo.find();
    const totalLessons = allLessons.length;
    // Get user progresses
    const progresses = await this.progressRepo.find({ where: { user_id: userId } });
    // Map lessonId to completion_pct for user
    const progressMap = new Map<number, number>();
    progresses.forEach((p) => progressMap.set(p.lesson_id, Number(p.completion_pct)));
    // For each lesson, get user's completion_pct or 0 if not started
    let sumPct = 0;
    allLessons.forEach((lesson) => {
      sumPct += progressMap.get(lesson.id) ?? 0;
    });
    const progressPct = totalLessons > 0 ? sumPct / totalLessons : 0;
    return {
      id: user.id,
      username: user.username,
      total_xp: user.total_xp,
      current_streak: user.current_streak,
      best_streak: user.best_streak,
      progress_pct: Math.round(progressPct * 100) / 100,
    };
  }
}
