"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function UpdateBloodStock() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [APlus, setAPlus] = useState("");
  const [AMinus, setAMinus] = useState("");
  const [BPlus, setBPlus] = useState("");
  const [BMinus, setBMinus] = useState("");
  const [ABPlus, setABPlus] = useState("");
  const [ABMinus, setABMinus] = useState("");
  const [OPlus, setOPlus] = useState("");
  const [OMinus, setOMinus] = useState("");
  const [operation, setOperation] = useState("add");

  const [currentAPlus, setCurrentAPlus] = useState(0);
  const [currentAMinus, setCurrentAMinus] = useState(0);
  const [currentBPlus, setCurrentBPlus] = useState(0);
  const [currentBMinus, setCurrentBMinus] = useState(0);
  const [currentABPlus, setCurrentABPlus] = useState(0);
  const [currentABMinus, setCurrentABMinus] = useState(0);
  const [currentOPlus, setCurrentOPlus] = useState(0);
  const [currentOMinus, setCurrentOMinus] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const bankRef = doc(
          db,
          "blood_banks",
          user.uid
        );

        const bankSnap = await getDoc(bankRef);

        if (bankSnap.exists()) {
          const data = bankSnap.data();

          setCurrentAPlus(data.APlus || 0);
          setCurrentAMinus(data.AMinus || 0);
          setCurrentBPlus(data.BPlus || 0);
          setCurrentBMinus(data.BMinus || 0);
          setCurrentABPlus(data.ABPlus || 0);
          setCurrentABMinus(data.ABMinus || 0);
          setCurrentOPlus(data.OPlus || 0);
          setCurrentOMinus(data.OMinus || 0);
        }

        setLoading(false);
      } else {
        router.push("/blood-bank-login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async () => {
    const user = auth.currentUser;

    if (!user) return;

    setIsSaving(true);
    setSuccessMessage("");

    try {
      const bankRef = doc(
        db,
        "blood_banks",
        user.uid
      );

      const bankSnap = await getDoc(bankRef);

      if (!bankSnap.exists()) {
        alert("Blood bank not found.");
        return;
      }

      const current = bankSnap.data();

      const calculate = (
        currentValue: number,
        enteredValue: string
      ) => {

        const amount = Number(
          enteredValue || 0
        );

        if (operation === "add") {
          return currentValue + amount;
        }

        return Math.max(
          currentValue - amount,
          0
        );
      };

      const updates = {
        APlus: calculate(
          current.APlus || 0,
          APlus
        ),

        AMinus: calculate(
          current.AMinus || 0,
          AMinus
        ),

        BPlus: calculate(
          current.BPlus || 0,
          BPlus
        ),

        BMinus: calculate(
          current.BMinus || 0,
          BMinus
        ),

        ABPlus: calculate(
          current.ABPlus || 0,
          ABPlus
        ),

        ABMinus: calculate(
          current.ABMinus || 0,
          ABMinus
        ),

        OPlus: calculate(
          current.OPlus || 0,
          OPlus
        ),

        OMinus: calculate(
          current.OMinus || 0,
          OMinus
        ),

        lastUpdated: serverTimestamp(),
      };

      await updateDoc(
        bankRef,
        updates
      );

      setSuccessMessage(
        operation === "add"
          ? "Stock added successfully!"
          : "Stock removed successfully!"
      );

      // Reset all fields back to blank placeholders
      setAPlus("");
      setAMinus("");
      setBPlus("");
      setBMinus("");
      setABPlus("");
      setABMinus("");
      setOPlus("");
      setOMinus("");

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoHome = () => {
    setIsNavigating(true);
    router.push("/blood-bank-dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-red-600 mb-6"></div>
        <div className="text-xl font-bold text-slate-700 tracking-wide">
          Loading Data...
        </div>
      </div>
    );
  }

  const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans flex justify-center text-slate-900">
      <div className="w-full max-w-xl bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="border-b border-slate-200 pb-6 mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 tracking-tight">
            Update Blood Stock
          </h1>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setOperation("add")}
            className={`flex-1 py-3 rounded-xl font-bold ${
              operation === "add"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Add Stock
          </button>

          <button
            type="button"
            onClick={() => setOperation("remove")}
            className={`flex-1 py-3 rounded-xl font-bold ${
              operation === "remove"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Remove Stock
          </button>
        </div>

        <div className="flex flex-col space-y-6">

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              A+ Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentAPlus}
            </p>
            <input
              type="number"
              min="0"
              value={APlus}
              placeholder="0"
              onChange={(e) => setAPlus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              A- Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentAMinus}
            </p>
            <input
              type="number"
              min="0"
              value={AMinus}
              placeholder="0"
              onChange={(e) => setAMinus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              B+ Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentBPlus}
            </p>
            <input
              type="number"
              min="0"
              value={BPlus}
              placeholder="0"
              onChange={(e) => setBPlus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              B- Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentBMinus}
            </p>
            <input
              type="number"
              min="0"
              value={BMinus}
              placeholder="0"
              onChange={(e) => setBMinus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              AB+ Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentABPlus}
            </p>
            <input
              type="number"
              min="0"
              value={ABPlus}
              placeholder="0"
              onChange={(e) => setABPlus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              AB- Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentABMinus}
            </p>
            <input
              type="number"
              min="0"
              value={ABMinus}
              placeholder="0"
              onChange={(e) => setABMinus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              O+ Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentOPlus}
            </p>
            <input
              type="number"
              min="0"
              value={OPlus}
              placeholder="0"
              onChange={(e) => setOPlus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2 uppercase tracking-wide text-sm">
              O- Blood Units
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Current Stock: {currentOMinus}
            </p>
            <input
              type="number"
              min="0"
              value={OMinus}
              placeholder="0"
              onChange={(e) => setOMinus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-3.5 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

        </div>

        {successMessage && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-center font-bold">
            {successMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-200">
          
          <button
            onClick={handleSave}
            disabled={isSaving || isNavigating}
            className={`flex-1 flex justify-center items-center gap-3 px-6 py-4 rounded-xl font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 ${
              isSaving || isNavigating 
                ? "bg-red-400 cursor-not-allowed text-white/90" 
                : "bg-red-600 hover:bg-red-700 text-white active:scale-[0.98]"
            }`}
          >
            {isSaving && <LoadingSpinner />}
            {isSaving ? "Processing..." : "Save Changes"}
          </button>

          <button
            onClick={handleGoHome}
            disabled={isSaving || isNavigating}
            className={`flex-1 flex justify-center items-center gap-3 px-6 py-4 rounded-xl font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 ${
              isSaving || isNavigating 
                ? "bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98]"
            }`}
          >
            {isNavigating && <LoadingSpinner />}
            {isNavigating ? "Processing..." : "Go to Home Page"}
          </button>

        </div>

      </div>
    </div>
  );
}