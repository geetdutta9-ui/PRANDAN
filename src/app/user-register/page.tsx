"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function UserRegister() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("Assam");
  const [pinCode, setPinCode] = useState("");
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
  "West Karbi Anglong"
];

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {

  const dob = `${year}-${month}-${day}`;

  const response = await fetch(
  "/api/register-user",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: name,
      email,
      phone,
      password,
      district,
      state,
      pinCode,
      dob,
    }),
  }
);

const data = await response.json();

console.log("API Response:", data);

 const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

const user = userCredential.user;

await setDoc(doc(db, "users", user.uid), {
  fullName: name,
  email: email,
  phone: phone,
  dateOfBirth: dob,
  state: state,
  district: district,
  pinCode: pinCode,
  role: "user",
  createdAt: new Date(),
});

     router.push("/user-registration-success");

      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-red-600 mb-6">
          User Registration
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
<div className="flex justify-center mb-6">
  <Link
    href="/"
    className="border border-red-600 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-600 hover:text-white transition duration-300"
  >
    ← Return to Home
  </Link>
</div>

  <input
    type="text"
    placeholder="Full Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
    required
  />


  <input
    type="tel"
    placeholder="Phone Number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
    required
  />

 <div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Date of Birth
  </label>

  <div className="grid grid-cols-3 gap-2">

    <select
      value={day}
      onChange={(e) => setDay(e.target.value)}
      className="border border-gray-300 p-3 rounded-lg text-gray-900"
      required
    >
      <option value="">Day</option>
      {[...Array(31)].map((_, i) => (
        <option key={i + 1} value={i + 1}>
          {i + 1}
        </option>
      ))}
    </select>

    <select
      value={month}
      onChange={(e) => setMonth(e.target.value)}
      className="border border-gray-300 p-3 rounded-lg text-gray-900"
      required
    >
      <option value="">Month</option>
      <option value="01">January</option>
      <option value="02">February</option>
      <option value="03">March</option>
      <option value="04">April</option>
      <option value="05">May</option>
      <option value="06">June</option>
      <option value="07">July</option>
      <option value="08">August</option>
      <option value="09">September</option>
      <option value="10">October</option>
      <option value="11">November</option>
      <option value="12">December</option>
    </select>

    <select
      value={year}
      onChange={(e) => setYear(e.target.value)}
      className="border border-gray-300 p-3 rounded-lg text-gray-900"
      required
    >
      <option value="">Year</option>

      {Array.from(
        { length: new Date().getFullYear() - 1949 },
        (_, i) => new Date().getFullYear() - i
      ).map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>

  </div>
</div>

 <input
  type="text"
  value="Assam"
  readOnly
  className="w-full border border-gray-300 p-3 rounded-lg bg-gray-100 text-gray-900"
/>

  <select
    value={district}
    onChange={(e) => setDistrict(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900"
    required
  >
    <option value="">Select District</option>

    {assamDistricts.map((d) => (
      <option key={d} value={d}>
        {d}
      </option>
    ))}
  </select>

  <input
    type="text"
    placeholder="PIN Code"
    value={pinCode}
    onChange={(e) => setPinCode(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
    required
  />
<input
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 placeholder-gray-500"
    required
  />
 <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border border-gray-300 p-3 rounded-lg text-gray-900 pr-12"
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </button>
</div>

  <button
    type="submit"
    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
  >
    Register
  </button>

</form>
      </div>
    </div>
  );
}