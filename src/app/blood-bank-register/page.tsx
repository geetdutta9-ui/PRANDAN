"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BloodBankRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [bloodBankName, setBankName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Assam");
  const [district, setDistrict] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [password, setPassword] = useState("");

  const assamDistricts = [
    "Baksa",
    "Barpeta",
    "Biswanath",
    "Bongaigaon",
    "Cachar",
    "Charaideo",
    "Darrang",
    "Dhemaji",
    "Dhubri",
    "Dibrugarh",
    "Goalpara",
    "Golaghat",
    "Hailakandi",
    "Hojai",
    "Jorhat",
    "Kamrup",
    "Kamrup Metro",
    "Karbi Anglong",
    "Karimganj",
    "Kokrajhar",
    "Lakhimpur",
    "Majuli",
    "Morigaon",
    "Nagaon",
    "Nalbari",
    "Sivasagar",
    "Sonitpur",
    "South Salmara",
    "Tinsukia",
    "Udalguri",
    "West Karbi Anglong",
  ];

  const router = useRouter();

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
    const response = await fetch(
  "/api/register-blood-bank",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bloodBankName,
      email,
      phone,
      state,
      district,
      password,
    }),
  }
);

const data = await response.json();

console.log("BLOOD BANK REGISTER API:", data);

const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

      const user = userCredential.user;

      await setDoc(
        doc(db, "blood_banks", user.uid),
        {
          bloodBankName,
          email,
          phone,
          state,
          district,
          licenseNumber,

          role: "blood_bank",

          APlus: 0,
          AMinus: 0,
          BPlus: 0,
          BMinus: 0,
          OPlus: 0,
          OMinus: 0,
          ABPlus: 0,
          ABMinus: 0,

          createdAt: new Date(),
        }
      );

      router.push("/blood-bank-registration-success");

      setBankName("");
      setEmail("");
      setPhone("");
      setDistrict("");
      setLicenseNumber("");
      setPassword("");

    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">

        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          Blood Bank Registration
        </h1>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
          autoComplete="off"
        >

          <input
            type="text"
            placeholder="Blood Bank Name"
            value={bloodBankName}
            autoComplete="off"
            onChange={(e) =>
              setBankName(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900 placeholder:text-gray-400"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            autoComplete="off"
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900 placeholder:text-gray-400"
            required
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            autoComplete="off"
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900 placeholder:text-gray-400"
            required
          />

            <input
           type="text"
            value="Assam"
            readOnly
            className="w-full border p-3 rounded-lg bg-gray-100 text-gray-900" />
            
          <select
            value={district}
            onChange={(e) =>
              setDistrict(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900"
            required
          >
            <option value="">
              Select District
            </option>

            {assamDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="License Number"
            value={licenseNumber}
            autoComplete="off"
            onChange={(e) =>
              setLicenseNumber(e.target.value)
            }
            className="w-full border p-3 rounded-lg text-gray-900 placeholder:text-gray-400"
            required
          />

          <div className="relative">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              autoComplete="new-password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border p-3 rounded-lg pr-12 text-gray-900 placeholder:text-gray-400"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
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

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition"
          >
            Register Blood Bank
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