import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from './lesson.entity';

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'lesson_id' })
  lesson_id: number;

  @Column({ length: 20 })
  type: string; // 'multiple_choice' | 'input'

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'text' })
  correct_answer: string;

  @Column({ default: 10 })
  xp_value: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
