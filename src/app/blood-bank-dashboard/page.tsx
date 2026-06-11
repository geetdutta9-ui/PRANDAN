"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function BloodBankDashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [bloodBankName, setBloodBankName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [activeSOSCount, setActiveSOSCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");

  const [APlus, setAPlus] = useState(0);
  const [AMinus, setAMinus] = useState(0);
  const [BPlus, setBPlus] = useState(0);
  const [BMinus, setBMinus] = useState(0);
  const [ABPlus, setABPlus] = useState(0);
  const [ABMinus, setABMinus] = useState(0);
  const [OPlus, setOPlus] = useState(0);
  const [OMinus, setOMinus] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push("/blood-bank-login");
          return;
        }

        try {
          const docRef = doc(
            db,
            "blood_banks",
            user.uid
          );

          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            setBloodBankName(data.bloodBankName || "");
            setEmail(data.email || "");
            setPhone(data.phone || "");
            setState(data.state || "");
            setDistrict(data.district || "");
            setLicenseNumber(data.licenseNumber || "");
            
            if (data.lastUpdated) {
              const date = data.lastUpdated.toDate();

              setLastUpdated(
                `${date.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}, ${date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}`
              );
            }

            setAPlus(data.APlus || 0);
            setAMinus(data.AMinus || 0);
            setBPlus(data.BPlus || 0);
            setBMinus(data.BMinus || 0);
            setABPlus(data.ABPlus || 0);
            setABMinus(data.ABMinus || 0);
            setOPlus(data.OPlus || 0);
            setOMinus(data.OMinus || 0);
          }
        } catch (error) {
          console.error(error);
        }
        await loadActiveSOSCount();

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  const loadActiveSOSCount = async () => {
    try {
      const q = query(
        collection(db, "sos_requests"),
        where("status", "==", "active")
      );

      const snapshot = await getDocs(q);

      setActiveSOSCount(snapshot.size);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600 mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  const totalUnits =
    APlus +
    AMinus +
    BPlus +
    BMinus +
    ABPlus +
    ABMinus +
    OPlus +
    OMinus;

  let stockStatus = "Low";

  if (totalUnits > 50) {
    stockStatus = "Healthy";
  } else if (totalUnits > 20) {
    stockStatus = "Moderate";
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-100">

      {/* PRANDAN Global Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-red-700">
                PRANDAN
              </h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase">
                Donate Blood • Save Lives
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">

        {/* Top Section Grid (Welcome + Stats Highlight) */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {bloodBankName}.
            </h2>
            <p className="text-gray-500 mb-8 max-w-lg">
              Manage your current blood inventory, update availability, and monitor emergency requests from your local community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/blood-bank-active-sos")}
                className="bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
              >
                 Active SOS Requests ({activeSOSCount})
              </button>
              
              <button
                onClick={() => router.push("/update-blood-stock")}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition"
              >
                Manage Stock
              </button>

              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Highlight Stats Card (Matches Emergency SOS visually) */}
          <div className={`border shadow-sm rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden ${
            stockStatus === "Healthy" ? "bg-green-50 border-green-200" :
            stockStatus === "Moderate" ? "bg-yellow-50 border-yellow-200" :
            "bg-red-50 border-red-200"
          }`}>
            <div className="relative z-10 flex flex-col items-center">
              <p className={`text-xl font-bold uppercase tracking-wider mb-2 ${
                stockStatus === "Healthy" ? "text-green-700" :
                stockStatus === "Moderate" ? "text-yellow-700" :
                "text-red-700"
              }`}>
                Total Units Available
              </p>
              <h2 className={`text-2xl font-black mb-4 ${
                stockStatus === "Healthy" ? "text-green-900" :
                stockStatus === "Moderate" ? "text-yellow-900" :
                "text-red-900"
              }`}>
                {totalUnits}
              </h2>
              <div className={`px-4 py-1.8 rounded-full text-sm font-bold border ${
                stockStatus === "Healthy" ? "bg-green-100 border-green-300 text-green-800" :
                stockStatus === "Moderate" ? "bg-yellow-100 border-yellow-300 text-yellow-800" :
                "bg-red-100 border-red-300 text-red-800"
              }`}>
                Status: {stockStatus}
              </div>
              <p className="text-xs mt-4 opacity-75 font-medium">
                Last Updated: {lastUpdated || "Never"}
              </p>
            </div>
          </div>

        </div>

        {/* Lower Section Grid (Profile + Inventory) */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Profile Details (1 Column) */}
          <div className="lg:col-span-1 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Profile Details
            </h2>

            <div className="space-y-5 flex-1">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                <p className="font-semibold text-base text-gray-900 break-words">{email}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                <p className="font-semibold text-base text-gray-900">{phone}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">State</p>
                <p className="font-semibold text-base text-gray-900">{state}</p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">District</p>
                <p className="font-semibold text-base text-gray-900">{district}</p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">License Number</p>
                <p className="font-semibold text-sm text-gray-700 bg-gray-50 inline-block px-3 py-1 rounded border border-gray-200 mt-1">{licenseNumber}</p>
              </div>
            </div>
          </div>

          {/* Current Blood Stock Panel (2 Columns) */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-s font-bold text-gray-900">Current Blood Stock</h2>
                <p className="text-sm text-gray-500 mt-1">Live overview of your current inventory levels.</p>
              </div>
            </div>

            {/* Grid for stock cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {[
                { type: "A+", count: APlus },
                { type: "A-", count: AMinus },
                { type: "B+", count: BPlus },
                { type: "B-", count: BMinus },
                { type: "AB+", count: ABPlus },
                { type: "AB-", count: ABMinus },
                { type: "O+", count: OPlus },
                { type: "O-", count: OMinus },
              ].map((blood, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center hover:border-red-300 hover:bg-white hover:shadow-md transition-all group">
                  <h3 className="font-bold text-gray-500 group-hover:text-red-700 text-sm transition-colors">{blood.type}</h3>
                  <p className="text-xs font-extrabold text-gray-900 mt-1 truncate w-full text-center">{blood.count}</p>
                </div>
              ))}

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}