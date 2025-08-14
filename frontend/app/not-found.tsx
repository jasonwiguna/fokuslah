"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Image
        src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
        alt="Not Found Mascot"
        width={120}
        height={120}
        className="mb-6"
      />
      <h1 className="text-4xl font-bold text-blue-700 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Oops! The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/lessons">
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors">
          Go to Lessons
        </button>
      </Link>
    </div>
  );
}
