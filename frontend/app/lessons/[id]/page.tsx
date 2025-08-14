"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fetchLessonDetail, submitLesson } from "../../../services/lessonsService";
import { v4 as uuidv4 } from "uuid";

interface ProblemOption {
  id: number;
  option_text: string;
}

interface Problem {
  id: number;
  type: string;
  question_text: string;
  options?: ProblemOption[];
}


interface Result {
  xp_earned: number;
  current_streak: number;
  best_streak: number;
  progress?: {
    completion_pct: number;
  } | null;
}

interface LessonDetail {
  id: number;
  title: string;
  description: string;
  problems: Problem[];
}

export default function LessonDetailPage() {
  const params = useParams();
  const lessonIdRaw = params?.id;
  const lessonId = Array.isArray(lessonIdRaw) ? lessonIdRaw[0] : lessonIdRaw;
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [problemId: number]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!lessonId) return;
    fetchLessonDetail(lessonId)
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load lesson");
        setLoading(false);
      });
  }, [lessonId]);

  if (loading) return <div>Loading lesson...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!lesson) return <div>Lesson not found.</div>;

  const handleChange = (problemId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [problemId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < lesson.problems.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!lesson) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const userId = 1; // Replace with actual user ID logic
      const attempt_id = uuidv4();
      const payload = {
        attempt_id,
        answers: lesson.problems.map((p) => ({
          problem_id: p.id,
          answer: answers[p.id] || "",
        })),
        userId
      };
      if (!lessonId) throw new Error("Lesson ID missing");
      const res = await submitLesson(lessonId, payload);
      setResult(res);
      setShowResult(true);
      // Animate progress reveal
      if (res?.progress?.completion_pct) {
        let pct = 0;
        const interval = setInterval(() => {
          pct += 2;
          setProgress(Math.min(pct, res.progress.completion_pct));
          if (pct >= res.progress.completion_pct) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
      }
    } catch {
      setSubmitError("Failed to submit answers");
    } finally {
      setSubmitting(false);
    }
  };

  const currentProblem = lesson.problems[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center">
      {/* Lesson title */}
      <h1 className="text-3xl font-bold mb-2 text-center w-full">{lesson.title}</h1>
      {/* Top image */}
      <Image
        src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
        alt="Mascot"
        width={120}
        height={120}
        className="mb-4"
      />

      {!showResult ? (
        <>
          {/* Question card */}
          <div className="bg-white rounded-xl shadow-md p-6 w-full text-center">
            <h2 className="text-lg font-semibold mb-6">
              {currentProblem.question_text}
            </h2>

            {currentProblem.type === "multiple_choice" && currentProblem.options && (
              <div className="grid grid-cols-2 gap-4">
                {currentProblem.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange(currentProblem.id, opt.option_text)}
                    className={`border rounded-lg px-4 py-3 font-medium ${
                      answers[currentProblem.id] === opt.option_text
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {opt.option_text}
                  </button>
                ))}
              </div>
            )}

            {currentProblem.type === "input" && (
              <input
                type="text"
                className="mt-4 border rounded-lg px-3 py-2 w-full text-center"
                value={answers[currentProblem.id] || ""}
                onChange={(e) =>
                  handleChange(currentProblem.id, e.target.value)
                }
                placeholder="Type your answer..."
              />
            )}
          </div>

          {/* Bottom navigation */}
          <div className="flex justify-between items-center w-full mt-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="bg-gray-200 text-gray-600 px-5 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              Previous
            </button>

            {currentIndex < lesson.problems.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>

          {submitError && (
            <div className="mt-4 text-red-500 text-sm">{submitError}</div>
          )}
        </>
      ) : result ? (
        <div className="w-full max-w-md mx-auto p-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Result</h1>
          <div className="mb-4 text-lg">XP Gained: <span className="font-semibold text-green-600">+{result.xp_earned}</span></div>
          <div className="mb-2">Current Streak: <span className="font-semibold">{result.current_streak}</span></div>
          <div className="mb-6">Best Streak: <span className="font-semibold">{result.best_streak}</span></div>
          <div className="w-full mb-2">Progress:</div>
          <div className="w-full bg-gray-200 rounded-full h-6 mb-4 overflow-hidden">
            <div
              className="bg-blue-500 h-6 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            >
              <span className="pl-2 text-white font-semibold">
                {progress}%
              </span>
            </div>
          </div>
          <div className="mt-4 animate-bounce text-green-600 text-xl font-bold">
            {progress === result.progress?.completion_pct ? "Completed!" : null}
          </div>
        </div>
      ) : null}
      {/* Back to Lessons button after results */}
      {showResult && result && (
        <button
          onClick={() => window.location.href = "/lessons"}
          className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium border border-gray-300 shadow-sm transition-colors"
        >
          ← Back to Lessons
        </button>
      )}
    </div>
  );
}
