"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// ✅ Step 1: calculateAge() function
const calculateAge = (dob: string) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export default function UserProfile() {
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDonor, setIsDonor] = useState(false);
  const [donorError, setDonorError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setIsDonor(data.isDonor || false);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading Profile...
      </div>
    );
  }

  const handleBecomeDonor = () => {
    const age = calculateAge(userData?.dateOfBirth);

    if (age < 18) {
      setDonorError(
        "You are currently not eligible to become a blood donor. Minimum age requirement is 18 years."
      );
      return;
    }

    setDonorError("");
    router.push("/donor-register");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-red-700">PRANDAN</h1>
            <p className="text-gray-500">User Profile</p>
          </div>

          <div className="flex flex-col">
            {!isDonor && (
              <button
                onClick={handleBecomeDonor}
                className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Become a Blood Donor
              </button>
            )}

            {donorError && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium max-w-sm">
                ⚠️ {donorError}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/user-dashboard")}
              className="bg-gray-800 text-white hover:bg-black px-5 py-3 rounded-xl font-semibold shadow-sm"
            >
              ← Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 h-40 relative">
            <div className="absolute -bottom-12 left-10">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center text-4xl font-black text-red-600 shadow-lg">
                {userData?.fullName ? userData.fullName.charAt(0).toUpperCase() : "?"}
              </div>
            </div>
          </div>

          <div className="pt-16 px-10 pb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {userData?.fullName}
            </h2>

            <div className="mt-2">
              {isDonor ? (
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                  Registered Blood Donor
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-bold">
                  User Account
                </span>
              )}
            </div>

            {/* Information Grid */}
            <div className="flex flex-col gap-4 mt-10">
              <InfoCard title="Email" value={userData?.email} />
              <InfoCard title="Phone Number" value={userData?.phone} />
              <InfoCard title="Date of Birth" value={userData?.dateOfBirth} />
              <InfoCard title="District" value={userData?.district} />
              <InfoCard title="State" value={userData?.state} />
              <InfoCard title="PIN Code" value={userData?.pinCode} />

              {isDonor && (
                <>
                  <div className="border-t border-gray-200 my-4"></div>
                  <h3 className="text-xl font-bold text-red-700">
                    Donor Information
                  </h3>
                  <InfoCard title="Donor Status" value="Active Blood Donor" />
                  <InfoCard title="Blood Group" value={userData?.bloodGroup} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </p>
      <p className="text-lg font-semibold text-gray-900 break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}