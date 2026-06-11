"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
const [success, setSuccess] = useState(false);

  const handleReset = async () => {
  try {
    await sendPasswordResetEmail(auth, email);

    setSuccess(true);
    setEmail("");

  } catch (error: any) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 mb-4"
        />

        <button
          onClick={handleReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
        >
          Send Reset Link
        </button>
        {success && (
  <p className="text-green-600 text-center mt-3 font-medium">
    Password reset link has been sent to your email.
  </p>
)}

        <Link
          href="/user-login"
          className="block mt-4 text-center text-red-600 hover:underline"
        >
          Back to Login
        </Link>

      </div>
    </div>
  );
}