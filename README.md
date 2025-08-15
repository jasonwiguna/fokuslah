# Next.js + NestJS Monorepo Boilerplate

This project contains a basic monorepo setup with:
- **frontend/**: Next.js (TypeScript, App Router, Tailwind, ESLint)
- **backend/**: NestJS (TypeScript, npm)

## Getting Started

### Frontend (Next.js)
```
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3001](http://localhost:3001) to view the app.

### Backend (NestJS)
```
cd backend
npm install
npm run start:dev
```
API will be available at [http://localhost:3000](http://localhost:3000) by default.

## Project Structure
- `frontend/` - Next.js app
- `backend/` - NestJS app

## Customization
- Update each app independently as needed.
- Add shared code or environment config as required.

---

For more details, see the README files in each subdirectory.

# Time Management

- Setup Boilerplate and dev dependencies: 10 minutes
- Database design: 30 minutes
- Database migration: 20 minutes
- Database seed script: 15 minutes
- API implementation: 2 hours
- Lessons page: 20 minutes
- Problems page: 1 hour
- Profile page: 20 minutes
- Error handling and helper pages: 15 minutes

Total time: 5 hours 20 minutes

# Team Development Strategy

For a team of 2–3 developers, you’ll want the codebase structured so each person can:
- Work in parallel without stepping on each other’s toes
- Clearly understand where to add/change features
- Ship features quickly without creating long-lived merge conflicts

Here’s how I’d structure it.

### 1. Folder Structure
Backend (NestJS + PostgreSQL)
```
backend/
  src/
    modules/
      lessons/
        lessons.controller.ts
        lessons.service.ts
        lessons.module.ts
        dto/
          create-lesson.dto.ts
          submit-lesson.dto.ts
        entities/
          lesson.entity.ts
          problem.entity.ts
          problem-option.entity.ts
        tests/
          lessons.service.spec.ts
      users/
        users.controller.ts
        users.service.ts
        entities/
          user.entity.ts
        tests/
      submissions/
        submissions.controller.ts
        submissions.service.ts
        entities/
          submission.entity.ts
          submission-answer.entity.ts
    common/
      decorators/
      filters/
      interceptors/
      utils/
    config/
      database.config.ts
      env.config.ts
    app.module.ts
    main.ts
  migrations/
  test/                     # e2e tests
```
Why:
Each feature (lessons, users, submissions) is self-contained → 2 developers can work on different modules.
DTOs live alongside their module to keep validation and contracts close to the API code.
Entities inside the module they belong to, avoiding a giant shared `entities/` folder.

Frontend (Next.js)
```
frontend/
  src/
    app/                 # Next.js app router
      lessons/
        [id]/
          page.tsx       # Lesson detail
          components/
            ProblemCard.tsx
            NavigationButtons.tsx
        page.tsx         # Lessons list
      profile/
        page.tsx
    components/          # Shared UI components (buttons, header, loader)
    services/            # API calls (axios/fetch wrappers)
      lessonsService.ts
      usersService.ts
    hooks/               # Custom hooks (useAuth, useProgress)
    utils/               # Formatting, constants
    types/               # Shared TypeScript interfaces
    styles/              # Tailwind config, global.css
```
Why:
Keeps lesson-specific UI in the `lessons/` route folder.
Shared logic (API calls, hooks) is separated so multiple devs can reuse.
Types are centralized so backend and frontend stay in sync.

### 2. Branching Workflow
We follow GitHub Flow with a `dev` integration branch:
- `main` → always production-ready (deployed).
- `dev` → staging branch for integration testing.
- feature branches → created from `dev`, e.g.:
  - `feature/lesson-submission`
  - `feature/streak-logic`
  - `fix/progress-bar`
  - `chore/update-readme`

Flow:
- Create branch from `dev`.
- Commit small, focused changes.
- Push and open PR → base: `dev`.
- PR reviewed & approved by at least one teammate.
- After testing on staging, merge `dev` → `main`.

### 3. Code Review Process
- Small PRs only (<300 lines changed) → easier to review & merge.
- Every PR must:
  - Pass lint check (`eslint` + Prettier).
  - Pass tests (unit + integration).
  - Have clear title & description of changes.
- Reviewer responsibilities:
  - Verify feature meets acceptance criteria.
  - Check for breaking changes to shared DTOs or API contracts.
  - Suggest improvements without blocking unless critical.

### 4. Parallel Development Guidelines
To avoid conflicts and maximize speed:
- Backend split into feature modules:
  - `lessons/` (Dev A)
  - `submissions/` (Dev B)
  - `users/` (Dev C or shared)
- Frontend split by route:
  - `/lessons` list + detail page (Dev A)
  - `/profile` stats page (Dev B)
  - Shared components + API services (Dev C)

Key Rule:  
Shared types and API DTOs live in `/common` (backend) and `/types` (frontend).
Once agreed for the sprint, don’t change them mid-sprint unless coordinated.

### 5. Merge Conflict Prevention
- Avoid editing the same file as another active PR.
- Merge from `dev` into your branch daily to stay in sync.
- Use feature flags to hide unfinished work without blocking merges.
- Extract reusable UI into `frontend/src/components/` so styling changes don’t affect feature branches.

### 6. Developer Experience
- Prettier + ESLint enforced with `husky` pre-commit hook:
```
npx husky install
```
- Consistent Local Dev:
Everyone runs DB in Docker with the same `docker-compose.yml`.
- Seed Data:
`npm run seed` sets up lessons, problems, and a demo user for testing.
- .env.example:
Required for all new developers — no guessing environment variables.

### 7. Sprint Coordination
- Kickoff meeting: agree on contracts (DTOs, API responses).
- Daily stand-up: blockers, progress, priorities.
- End-of-sprint merge freeze: no new features, only bug fixes before merging to `main`.

# AI/ML Integration Strategy

### 1. Goals
- Personalized learning path for each student based on their performance.
- Boost engagement by recommending the right difficulty level at the right time.
- Improve retention by spotting early signs of disengagement.

### 2. Where to Integrate AI/ML
A. Personalized Problem Recommendations
- Trigger: After every lesson submission.
- Logic:
  1. Model analyzes:
      - Accuracy per topic
      - Time taken per problem
      - Historical performance trends
  2. Predicts next best problem difficulty:
      - If accuracy > 85% → move up difficulty.
      - If accuracy < 60% → recommend review questions.
- Model type: Collaborative filtering + rule-based fallback.
- Data needed:
  - Problem difficulty tags
  - User performance history (`submission_answers`)
  - Lesson completion patterns

B. Streak Retention Prediction
- Trigger: Once daily per user.
- Logic:
  - Train a binary classifier to predict "Will this user miss tomorrow?"
  - Features:
    - Last 7-day streak activity
    - Lesson difficulty progression
    - XP earned trend
    - Time of day they usually play
  - If at risk → send push/email reminder with a "quick win" problem.
- Model type: Logistic regression or gradient boosting.
- Data needed:
  - Login/activity timestamps
  - Streak history
  - Problem completion times

C. Automated Weakness Detection
- Trigger: Weekly review.
- Logic:
  - Identify problem categories where accuracy < 70%.
  - Auto-generate a “Revision Lesson” mixing old questions and variations.
- Model type: Simple topic clustering + accuracy filtering.
- Data needed:
  - Problem tags (addition, multiplication, fractions, etc.)
  - User accuracy per tag
  - Time since last practice
  
### 3. How to Collect Data
- Backend DB Tables:
  - `submissions` & `submission_answers` → store correctness, time taken.
  - `problems` → store `difficulty_level` & `tags`.
  - `user_progress` → track historical completion % per lesson.
- Extra fields to add:
  - `time_taken_ms` in `submission_answers`.
  - `difficulty_level` (enum: easy, medium, hard) in `problems`.

### 4. Architecture for AI
- Phase 1 (MVP) → Rule-based personalization in backend service:
  - Simple if/else logic for difficulty progression.
- Phase 2 → Add ML microservice:
  - Python FastAPI or Flask service with scikit-learn or TensorFlow.
  - Backend calls it with recent performance stats.
  - Returns recommendation set to the frontend.

### 5. Business Impact
- Better Engagement: Tailored challenges keep teens motivated.
- Faster Mastery: Weakness detection accelerates learning progress.
- Retention Boost: Early warning system for streak drop-off.

# Technical Communication Example

One technical decision made in this project is how to handle answer submission. One approach is to let users keep retrying and earning XP. As a business decision, this makes sense so that users have the incentive to retry and get as much XP with each retry. They also benefit from the repetition in terms of their mastery. However, I decided to keep it in the most logical sense to prevent any future loophole. Users can still retry completed lessons, but they will not gain any XP for that. I also made sure that each submission is only one transaction, to prevent partial writes to the database that would be difficult to rollback.

**Topic**: Preventing XP Farming and Duplicate Rewards

**The Business Problem:**
We reward students with XP for correct answers to keep them motivated. But if the system isn’t careful, a clever student could repeatedly submit the same correct answers to rack up unlimited XP — or get double XP if they hit “submit” twice due to a slow internet connection.

**Our Technical Solution:**
We added two key safety nets:
1. XP Farming Prevention
- The system checks if a student has already answered a question correctly before.
- If yes, they get zero XP for that problem in future attempts.
- This means students can still retry lessons for practice, but can’t artificially boost their score.
2. Idempotency via `attempt_id`
- Every submission has a unique `attempt_id` (like a receipt number).
- If the same `attempt_id` comes in twice (e.g., the student clicks “submit” twice or the browser resends), the backend just re-sends the original result — no extra XP is awarded.
- This ensures network glitches don’t cause score inflation.

**Business Impact:**
- Fair Competition: Prevents leaderboard abuse and keeps XP meaningful.
- Student Trust: No accidental double-rewards or penalties from glitches.
- Operational Stability: Avoids messy data corrections for duplicate entries.

**Analogy:**

It’s like a teacher grading homework:
- If you hand in the same paper twice, they don’t give you two grades — they just remind you of your original score.
- And if you try to get extra marks by handing in an old paper you’ve already got full marks for, it won’t work.

# Product Strategy

Technical Improvements for fokuslah.com

**1. Gamified Progress Reveals**
- **Current Gap:** Lesson completion feedback is static and text-heavy.  
- **Improvement:** Add animated XP meters, streak flames, and badge pop-ups after each submission (similar to Duolingo’s “Level Up” animations).  
- **Tech Implementation:**
  - Frontend: Framer Motion animations triggered by API results.
  - Backend: Include XP/streak delta in `/submit` response.
- **Business Impact:** Makes completing lessons more rewarding, increasing daily active users.

**2. Adaptive Difficulty Engine**
- **Current Gap:** All users see the same problem set regardless of skill level.
- **Improvement:** Dynamically adjust upcoming problem difficulty based on accuracy and time taken in recent lessons.
- **Tech Implementation:**
  - Backend: Add `difficulty_level` to problems and rule-based selection logic.
  - Phase 2: Upgrade to ML-based recommendations.
- **Business Impact:** Keeps advanced students challenged while supporting those who need more practice, improving retention.

**3. Daily Challenge & Social Leaderboards**
- **Current Gap:** Limited reason for teens to return daily beyond streak count.
- **Improvement:** Introduce a “Daily Challenge” (5 timed questions) and friend/peer leaderboards.
- **Tech Implementation:**
  - Backend: New `daily_challenges` table + scheduled seed job.
  - Frontend: Leaderboard UI, WebSocket updates for real-time ranking.
- **Business Impact:** Adds social motivation and short, repeatable engagement loops — ideal for teen audiences.

**Why These Three First?**
- **Fast to Ship:** All can be built with existing stack (NestJS + Next.js + PostgreSQL).
- **High Engagement ROI:** Directly tied to motivation mechanics that have proven success in similar apps.
- **Scalable:** Can evolve with AI personalization, seasonal events, and more complex rewards.

# Approach to Designing Engaging Post-Lesson Progress Reveals

1. Goals
- Give students a satisfying “victory moment” immediately after finishing a lesson.
- Reinforce their achievements: XP gained, streak maintained, and progress made.
- Create a reason to keep going (next lesson suggestion, badges earned).
2. Visual Flow
- Victory Animation (2–3 seconds)
  - Confetti burst or XP meter filling up.
  - Animated streak flame if streak continues.
  - Badge pop-up if milestone reached.
- Stats Recap Card
  - XP Earned: Large number, colored to match brand palette.
  - Streak Status: Fire icon + current streak count.
  - Lesson Progress: Circular or horizontal progress bar showing completion %.
- Next Action Buttons
  - “Continue to Next Lesson” (primary)
  - “Review Mistakes” (secondary)
  - “Share Achievement” (social media icon row)
3. Technical Implementation
Backend Changes
- Enhance `/submit` response to include:
```
{
  "xp_earned": 30,
  "xp_total": 450,
  "streak_current": 5,
  "streak_best": 12,
  "lesson_completion_pct": 80,
  "milestones": [
    { "type": "badge", "name": "Addition Master", "icon": "/badges/addition.png" }
  ]
}
```
- Compute milestones in backend so frontend only displays them.
Frontend Flow
- After successful `/submit`:
  - Display Full-Screen Overlay
    - Use Framer Motion for fade-in + scale animations.
  - Animate XP Bar
    - Animate from `previous_xp` to `xp_total`.
  - Trigger Confetti
    - Use canvas-confetti or similar for burst effect.
  - Streak Flame Animation
    - Flickering fire SVG with glow effect.
  - Show Buttons
    - Delay slightly so the user first sees the stats.
4. Business Impact
- Increased Lesson Completion Rate: The dopamine hit from animations motivates repeat sessions.
- Social Engagement: Shareable milestones promote organic growth.
- Retention: Streak visuals build habit formation.

# Handling Simultaneous Access

1. Goals
- Ensure smooth performance even when 1,000+ users are answering and submitting lessons at the same time.
- Prevent double XP or streak glitches under high load.
- Keep database response times low for read-heavy operations (lessons, progress).

2. Backend Scalability Plan

A. Database Optimization
- Indexes:
  - Add composite indexes on frequently queried fields:
    - `submissions(user_id, attempt_id)` → fast idempotency check.
    - `user_progress(user_id, lesson_id)` → quick progress lookup.
  - Index `problems(lesson_id)` for lesson detail queries.
- Connection Pooling:
  - Use a connection pool (via TypeORM + `pg` pool settings) to handle spikes.
- Read vs Write Separation (if needed):
  - For >1k concurrent users, add a read replica for lesson/progress queries.

B. Stateless API Design
- All requests contain `user_id` or session info → no server-side session stickiness.
- Multiple instances of the NestJS app can run behind a load balancer (AWS ALB / Nginx).

C. Idempotency Safety
- The `attempt_id` uniqueness constraint in the DB ensures no race condition awards duplicate XP.
- All `/submit` writes happen inside a transaction to keep XP, streak, and progress consistent even under concurrent requests.

D. Caching Strategy
- Lesson list & detail cached in Redis for 60s:
  - Offloads DB from repeated lesson fetches.
- User profile data cached on read and invalidated on update (e.g., after submission).

3. Frontend Optimization
- Pre-fetch lessons in the background while user is on the dashboard.
- Optimistic UI updates for XP/streak so the user sees instant feedback while backend confirms.
- Use React Query or SWR to cache lesson data locally and prevent duplicate network calls.

4. Deployment
- Containerized (Docker) services for backend and frontend.
- Horizontal scaling:
  - Start with 2 backend instances, autoscale to 4+ when CPU > 70%.
  - Frontend served via CDN for fast static asset delivery.
- Database hosted on managed PostgreSQL (AWS RDS / GCP Cloud SQL) with auto-scaling storage.

5. Monitoring & Alerts
- Use APM (e.g., New Relic, Datadog) to track:
  - API response times
  - DB query latency
  - Error rates per endpoint
- Set alerts for:
  - Response time > 500ms
  - DB CPU > 80%
  - Error rate > 1% in 5 minutes

Business Impact:  
This approach ensures that even with 1,000+ students hitting “Submit” at the same time (e.g., during a classroom activity), the system will process requests accurately, prevent duplicate rewards, and keep response times low — maintaining user trust and engagement.