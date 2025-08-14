import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Problem } from './problem.entity';

@Entity('problem_options')
export class ProblemOption {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Problem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'problem_id' })
  problem: Problem;

  @Column({ name: 'problem_id' })
  problem_id: number;

  @Column({ type: 'text' })
  option_text: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
