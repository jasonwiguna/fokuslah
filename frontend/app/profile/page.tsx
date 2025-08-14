"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchProfile } from "../../services/lessonsService";
import SomethingIsWrong from "../../components/SomethingIsWrong";
import LoadingSpinner from "../../components/LoadingSpinner";

interface ProfileData {
  total_xp: number;
  current_streak: number;
  best_streak: number;
  progress_pct: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = 1; // Replace with actual user ID logic
    fetchProfile(userId)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <SomethingIsWrong message={error} />;
  if (!profile) return <SomethingIsWrong message="Profile not found." />;

  return (
    <div className="w-full max-w-md mx-auto p-8 flex flex-col items-center">
      <Image
        src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
        alt="Profile Mascot"
        width={100}
        height={100}
        className="mb-4"
      />
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      <div className="w-full bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
        <div className="mb-4 text-lg">
          Total XP: <span className="font-semibold text-green-600">{profile.total_xp}</span>
        </div>
        <div className="mb-2">
          Current Streak: <span className="font-semibold">{profile.current_streak}</span>
        </div>
        <div className="mb-2">
          Best Streak: <span className="font-semibold">{profile.best_streak}</span>
        </div>
        <div className="w-full mb-2 mt-4">Progress:</div>
        <div className="w-full bg-gray-200 rounded-full h-6 mb-2 overflow-hidden">
          <div
            className="bg-blue-500 h-6 rounded-full transition-all duration-500 flex items-center"
            style={{ width: `${profile.progress_pct}%` }}
          >
            <span className="pl-2 text-white font-semibold">
              {profile.progress_pct}%
            </span>
          </div>
        </div>
      </div>
      {/* Button to go to lessons */}
      <button
        onClick={() => window.location.href = "/lessons"}
        className="mt-8 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors"
      >
        Go to Lessons
      </button>
    </div>
  );
}
