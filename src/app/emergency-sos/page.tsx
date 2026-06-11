"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function EmergencySOS() {
  const router = useRouter();

  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [unitsRequired, setUnitsRequired] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [district, setDistrict] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Array of Assam Districts for the dropdown
  const assamDistricts = [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo",
    "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat",
    "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metro", "Karbi Anglong",
    "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon",
    "Nalbari", "Sivasagar", "Sonitpur", "South Salmara", "Tinsukia",
    "Udalguri", "West Karbi Anglong"
  ];

  const handleSOS = async () => {
    setMessage("");

    if (
      !patientName ||
      !bloodGroup ||
      !unitsRequired ||
      !hospitalName ||
      !district ||
      !contactPerson ||
      !contactPhone
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first.");
        return;
      }

      await addDoc(collection(db, "sos_requests"), {
        userId: user.uid,

        patientName,
        bloodGroup,
        unitsRequired: Number(unitsRequired),

        hospitalName,
        state: "Assam", // Added State to the database save
        district,

        contactPerson,
        contactPhone,

        notes,

        status: "active",

        createdAt: serverTimestamp(),
      });

      setMessage("Emergency SOS created successfully.");

      setTimeout(() => {
       router.push("/my-sos");
      }, 2000);

    } catch (error) {
      console.error(error);
      setMessage("Failed to create SOS request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-10">

        <h1 className="text-3xl sm:text-4xl font-black text-red-700 mb-3 tracking-tight">
          Emergency Blood SOS
        </h1>

        <p className="text-gray-500 mb-8 text-lg">
          Create an urgent blood request and immediately notify the community.
        </p>

        {message && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl font-medium flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              Patient Name *
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium"
              placeholder="Full name of the patient"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              Blood Group *
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium cursor-pointer"
            >
              <option value="">Select Blood Group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              Units Required *
            </label>
            <input
              type="number"
              min="1"
              value={unitsRequired}
              onChange={(e) => setUnitsRequired(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium"
              placeholder="e.g., 2"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              Hospital Name *
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium"
              placeholder="Where is the blood needed?"
            />
          </div>

          {/* New Read-Only State Field */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              State *
            </label>
            <input
              type="text"
              value="Assam"
              readOnly
              className="w-full border border-gray-300 bg-gray-100 text-gray-900 p-3.5 rounded-xl font-medium cursor-not-allowed"
            />
          </div>

          {/* Updated District Dropdown */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              District *
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium cursor-pointer"
            >
              <option value="">Select District</option>
              {assamDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
              Contact Person *
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium"
              placeholder="Name of person to contact"
            />
          </div>

        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
            Contact Number *
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium"
            placeholder="10-digit mobile number"
          />
        </div>

        <div className="mt-6">
          <label className="block mb-2 text-sm font-bold text-gray-700 uppercase tracking-wide">
            Additional Notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 bg-white text-gray-900 p-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow font-medium resize-none"
            placeholder="Any specific instructions, exact ward number, or urgency details..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">

          <button
            onClick={handleSOS}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-4 px-6 rounded-xl text-lg font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? "Broadcasting SOS..." : "Broadcast Emergency SOS"}
          </button>

          <button
            onClick={() => router.push("/user-dashboard")}
            className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 py-4 px-6 rounded-xl text-lg font-bold transition-all"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}