"use client";


import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchLessons, Lesson } from "../../services/lessonsService";
import SomethingIsWrong from "../../components/SomethingIsWrong";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = 1; // Replace with actual user ID logic
    fetchLessons(userId)
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load lessons");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <SomethingIsWrong message={error} />;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center">
      <div className="w-full flex justify-end mb-2">
        <Link href="/profile">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium border border-gray-300 shadow-sm transition-colors">
            Profile
          </button>
        </Link>
      </div>
      {/* Top mascot image for consistency */}
      <Image
        src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
        alt="Mascot"
        width={120}
        height={120}
        className="mb-4"
      />
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700 drop-shadow">Lessons</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="w-full"
            passHref
          >
            <div className="bg-white rounded-xl shadow-md p-6 w-full text-center border border-blue-200 hover:scale-105 hover:shadow-xl transition-transform cursor-pointer flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-2 mb-2">
                <div className="bg-blue-100 text-blue-600 rounded-full p-2 mb-1">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/></svg>
                </div>
                <span className="font-bold text-lg text-blue-800 group-hover:text-blue-600 transition-colors">{lesson.title}</span>
              </div>
              <p className="text-gray-700 mb-2 min-h-[40px]">{lesson.description}</p>
              {lesson.progress && (
                <div className="w-full mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-blue-600 font-semibold">{lesson.progress.completion_pct}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${lesson.progress.completion_pct}%` }}
                    />
                  </div>
                </div>
              )}
              {!lesson.progress && (
                <div className="mt-2 text-xs text-gray-400 italic">Not started</div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
