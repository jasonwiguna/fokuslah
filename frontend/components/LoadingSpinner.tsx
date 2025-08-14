"use client";
import React from "react";
import Image from "next/image";

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <Image
      src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
      alt="Loading Mascot"
      width={80}
      height={80}
      className="mb-4 animate-bounce"
    />
    <div className="flex items-center gap-2">
      <span className="loader border-4 border-blue-200 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></span>
      <span className="text-blue-600 text-lg font-semibold">Loading...</span>
    </div>
  </div>
);

export default LoadingSpinner;
