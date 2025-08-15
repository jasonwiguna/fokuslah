// Fetch user profile data (total XP, streaks, progress)
export async function fetchProfile(userId: number) {
  const res = await fetch(`${BASE_URL}/profile?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}
export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000/api";

export interface Lesson {
  id: number;
  title: string;
  description: string;
  progress?: {
    completion_pct: number;
  } | null;
}

export async function fetchLessons(userId: number): Promise<Lesson[]> {
  const res = await fetch(`${BASE_URL}/lessons?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
}

export async function fetchLessonDetail(id: number | string) {
  const res = await fetch(`${BASE_URL}/lessons/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lesson detail");
  return res.json();
}

export async function submitLesson(
  id: number | string,
  payload: { attempt_id: string; answers: { problem_id: number; answer: string }[]; userId?: number }
) {
  const res = await fetch(`${BASE_URL}/lessons/${id}/submit?userId=${payload.userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit lesson");
  return res.json();
}
