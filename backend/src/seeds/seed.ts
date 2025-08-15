import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Lesson } from '../entities/lesson.entity';
import { Problem } from '../entities/problem.entity';
import { ProblemOption } from '../entities/problem_option.entity';
import { AppDataSource } from '../typeorm.config';

export default async function seed(dataSource: DataSource) {
  // Repositories
  const userRepo = dataSource.getRepository(User);
  const lessonRepo = dataSource.getRepository(Lesson);
  const problemRepo = dataSource.getRepository(Problem);
  const optionRepo = dataSource.getRepository(ProblemOption);

  // 1. Create Demo User
  const demoUser = userRepo.create({
    username: 'demo_user',
    email: 'demo@example.com',
    total_xp: 0,
    current_streak: 0,
    best_streak: 0,
  });
  await userRepo.save(demoUser);

  // 2. Create Lessons
  const lessons = await lessonRepo.save([
    lessonRepo.create({
      title: 'Basic Arithmetic',
      description: 'Practice simple addition and subtraction problems',
    }),
    lessonRepo.create({
      title: 'Multiplication Mastery',
      description: 'Sharpen your multiplication skills with times tables',
    }),
    lessonRepo.create({
      title: 'Division Basics',
      description: 'Learn the basics of division',
    }),
  ]);

  // Helper function to add problems + options
  const addProblem = async (
    lessonId: number,
    type: 'multiple_choice' | 'input',
    question: string,
    answer: string,
    xp: number,
    options?: string[],
  ) => {
    const problem = problemRepo.create({
      lesson: { id: lessonId },
      type,
      question_text: question,
      correct_answer: answer,
      xp_value: xp,
    });
    const savedProblem = await problemRepo.save(problem);

    if (type === 'multiple_choice' && options) {
      const problemOptions = options.map((opt) =>
        optionRepo.create({ problem: { id: savedProblem.id }, option_text: opt }),
      );
      await optionRepo.save(problemOptions);
    }
  };

  // 3. Lesson 1 Problems
  await addProblem(lessons[0].id, 'multiple_choice', 'What is 5 + 3?', '8', 10, ['6', '7', '8', '9']);
  await addProblem(lessons[0].id, 'multiple_choice', 'What is 10 - 4?', '6', 10, ['4', '5', '6', '7']);
  await addProblem(lessons[0].id, 'input', 'What is 7 + 6?', '13', 10);
  await addProblem(lessons[0].id, 'input', 'What is 15 - 9?', '6', 10);

  // 4. Lesson 2 Problems
  await addProblem(lessons[1].id, 'multiple_choice', 'What is 4 x 6?', '24', 10, ['22', '24', '26', '28']);
  await addProblem(lessons[1].id, 'multiple_choice', 'What is 7 x 8?', '56', 10, ['54', '55', '56', '57']);
  await addProblem(lessons[1].id, 'input', 'What is 9 x 9?', '81', 10);
  await addProblem(lessons[1].id, 'input', 'What is 12 x 3?', '36', 10);

  // 5. Lesson 3 Problems
  await addProblem(lessons[2].id, 'multiple_choice', 'What is 12 ÷ 4?', '3', 10, ['2', '3', '4', '5']);
  await addProblem(lessons[2].id, 'multiple_choice', 'What is 20 ÷ 5?', '4', 10, ['3', '4', '5', '6']);
  await addProblem(lessons[2].id, 'input', 'What is 15 ÷ 3?', '5', 10);
  await addProblem(lessons[2].id, 'input', 'What is 81 ÷ 9?', '9', 10);
}

if (require.main === module) {
  (async () => {
    await AppDataSource.initialize();
    try {
      await seed(AppDataSource);
    } finally {
      await AppDataSource.destroy();
    }
  })().then(() => {
    console.log('✅ Seed data inserted successfully');
    process.exit(0);
  }).catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
}
