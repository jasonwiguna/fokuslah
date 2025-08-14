import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { Lesson } from '../entities/lesson.entity';
import { UserProgress } from '../entities/user_progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, UserProgress])],
  controllers: [LessonsController],
  providers: [LessonsService],
})
export class LessonsModule {}
