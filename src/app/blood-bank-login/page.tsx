"use client";

import { useState } from "react";
import Link from "next/link";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function BloodBankLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {

  const response = await fetch(
    "/api/login-blood-bank",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data = await response.json();

  console.log("BLOOD BANK LOGIN API:", data);

  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );


      router.push("/blood-bank-dashboard");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Blood Bank Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
          autoComplete="off"
        >

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            autoComplete="off"
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900"
            required
          />

          <div className="relative">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border p-3 rounded-lg pr-12 text-gray-900"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>

          <div className="text-right">
  <Link
    href="/blood-bank-forgot-password"
    className="text-sm text-red-600 hover:underline"
  >
    Forgot Password?
  </Link>
</div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
          >
            Login
          </button>

        </form>

        <div className="mt-4 text-center">

          <Link
            href="/"
            className="text-red-600 hover:underline"
          >
            ← Return to Homepage
          </Link>

        </div>

      </div>

    </div>
  );
}