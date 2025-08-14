"use client";
import React from "react";
import Image from "next/image";

interface ErrorComponentProps {
  message?: string;
}

const SomethingIsWrong: React.FC<ErrorComponentProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Image
        src="https://www.fokuslah.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fcurious.9982602c.png&w=828&q=75"
        alt="Error Mascot"
        width={100}
        height={100}
        className="mb-4"
      />
      <h2 className="text-2xl font-bold text-red-600 mb-2">Something is wrong</h2>
      <p className="text-gray-700 text-center mb-4">
        {message || "An unexpected error occurred. Please try again later."}
      </p>
    </div>
  );
};

export default SomethingIsWrong;
