"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// Moved outside the component to prevent unnecessary re-creations on every render
const calculateAge = (dob: string | undefined | null) => {
  if (!dob) return 0; // Guard against missing DoB
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export default function DonorRegister() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [userId, setUserId] = useState("");

  // Personal Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  // Date of Birth & Age Calculation
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [calculatedAge, setCalculatedAge] = useState(0);

  // Physical Details
  const [bloodGroup, setBloodGroup] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");

  // Medical History (Streamlined)
  const [previousDonor, setPreviousDonor] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [hasMedicalConditions, setHasMedicalConditions] = useState(""); 
  const [recentTattoo, setRecentTattoo] = useState(""); 
  const [isPregnant, setIsPregnant] = useState(""); 

  // Emergency Contact
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const [availability, setAvailability] = useState("Yes");
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        setUserId(user.uid);

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();

          setFullName(data.fullName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setDistrict(data.district || "");
          setState(data.state || "");
          
          const age = calculateAge(data.dateOfBirth);
          setCalculatedAge(age);
          setDateOfBirth(data.dateOfBirth || "");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleRegister = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. Basic Information Validation
    if (!bloodGroup) return setErrorMessage("Please select your blood group.");
    if (!gender) return setErrorMessage("Please select your gender.");
    if (!weight) return setErrorMessage("Please enter your weight.");
    if (calculatedAge < 18) {
      return setErrorMessage(
        "You must be at least 18 years old to become a blood donor."
      );
    }

    if (calculatedAge > 65) {
      return setErrorMessage(
        "Maximum donor age is 65 years."
      );
    }
    
    if (Number(weight) < 45) {
      return setErrorMessage("Minimum weight requirement for blood donation is 45 kg.");
    }

    // 2. Medical History Validation
    if (!hasMedicalConditions || !recentTattoo || !previousDonor) {
      return setErrorMessage("Please answer all the medical history questions.");
    }

    if (gender === "Female" && !isPregnant) {
      return setErrorMessage("Please answer the pregnancy/breastfeeding question.");
    }

    // Check for any disqualifying medical conditions
    if (
      hasMedicalConditions === "Yes" || 
      recentTattoo === "Yes" ||
      (gender === "Female" && isPregnant === "Yes")
    ) {
      return setErrorMessage(
        "Based on your medical answers, you are currently not eligible for blood donation at this time."
      );
    }

    // 3. Final Declaration Validation
    if (!declaration) {
      return setErrorMessage("You must accept the final declaration tick box to become a donor.");
    }

    try {
      setSaving(true);

      const donorQuery = query(
        collection(db, "donors"),
        where("userId", "==", userId)
      );

      const donorSnap = await getDocs(donorQuery);

      if (!donorSnap.empty) {
        setErrorMessage("You are already registered as a donor!");
        setSaving(false);
        return;
      }

      await addDoc(collection(db, "donors"), {
        userId,
        fullName,
        email,
        phone,
        district,
        state,

        bloodGroup,
        gender,
        age: calculatedAge,
        weight: Number(weight),

        previousDonor: previousDonor === "Yes",
        lastDonationDate: previousDonor === "Yes" ? lastDonationDate : null,

        hasMedicalConditions: hasMedicalConditions === "Yes",
        recentTattoo: recentTattoo === "Yes",
        isPregnant: gender === "Female" ? (isPregnant === "Yes") : false,

        emergencyContactName,
        emergencyContactPhone,

        availability: availability === "Yes",

        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "users", userId), {
        isDonor: true,
        bloodGroup: bloodGroup,
      });

      setSuccessMessage("Donor registration successful! Redirecting...");
      
      setTimeout(() => {
        router.push("/user-dashboard");
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      if (!successMessage) setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 font-medium">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-3xl font-black text-red-700 mb-2">
          Become A Blood Donor
        </h1>
        <p className="text-gray-600 mb-6 font-medium">
          Help save lives by joining the PRANDAN donor network. Please fill out the form accurately.
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium flex items-center gap-3 shadow-sm">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-medium flex items-center gap-3 shadow-sm">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            <span>{successMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Personal Info */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Full Name</label>
                <input value={fullName} readOnly className="w-full border border-gray-300 p-3 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                <input value={email} readOnly className="w-full border border-gray-300 p-3 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Phone Number</label>
                <input value={phone} readOnly className="w-full border border-gray-300 p-3 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Section 2: Physical Details */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Physical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Group <span className="text-red-500">*</span></label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                <select
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    if (e.target.value !== "Female") setIsPregnant(""); 
                  }}
                  className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                <input
                  value={calculatedAge}
                  readOnly
                  className="w-full border border-gray-300 p-3 rounded-xl bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Weight (KG) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  placeholder="e.g. 60"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Medical Questionnaire */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Medical History & Eligibility <span className="text-red-500">*</span></h2>
            
            <div className="space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <label className="text-gray-700 font-medium">Do you currently have any serious illnesses, infectious diseases (e.g., HIV, Hepatitis), or heart-related problems?</label>
                <select value={hasMedicalConditions} onChange={(e) => setHasMedicalConditions(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-gray-900 w-full md:w-40 focus:ring-2 focus:ring-red-500 outline-none flex-shrink-0">
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <label className="text-gray-700 font-medium">Have you had any tattoos or piercings in the last 6 months?</label>
                <select value={recentTattoo} onChange={(e) => setRecentTattoo(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-gray-900 w-full md:w-40 focus:ring-2 focus:ring-red-500 outline-none flex-shrink-0">
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {gender === "Female" && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-pink-50 p-3 rounded-lg border border-pink-100">
                  <label className="text-gray-800 font-medium">Are you currently pregnant or breastfeeding?</label>
                  <select value={isPregnant} onChange={(e) => setIsPregnant(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-gray-900 w-full md:w-40 focus:ring-2 focus:ring-red-500 outline-none bg-white flex-shrink-0">
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-t pt-4 mt-2">
                <label className="text-gray-700 font-medium">Have you ever donated blood before?</label>
                <select value={previousDonor} onChange={(e) => setPreviousDonor(e.target.value)} className="border border-gray-300 p-2 rounded-lg text-gray-900 w-full md:w-40 focus:ring-2 focus:ring-red-500 outline-none flex-shrink-0">
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {previousDonor === "Yes" && (
                <div className="flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg border">
                  <label className="text-gray-700 font-medium text-sm">When was your last donation?</label>
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Emergency Contact - OPTIONAL */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Emergency Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact Name <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contact Phone <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Availability & Final Declaration */}
          <div className="space-y-4 bg-red-50 p-5 rounded-2xl border border-red-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <label className="text-red-900 font-bold">Are you currently available for donation if needed?</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="border border-red-300 p-2 rounded-lg text-red-900 w-full md:w-40 focus:ring-2 focus:ring-red-500 outline-none bg-white">
                <option value="Yes">Yes, I am available</option>
                <option value="No">No, currently unavailable</option>
              </select>
            </div>

            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={declaration}
                onChange={(e) => setDeclaration(e.target.checked)}
                className="mt-1 w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
              />
              <span className="text-gray-800 font-medium text-sm leading-relaxed">
                I hereby declare that all the information provided above is correct to the best of my knowledge. I understand the requirements and voluntarily agree to register as a blood donor. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRegister}
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? "Registering as Donor..." : "Confirm & Register As Donor"}
            </button>

            <button
              onClick={() => router.push("/user-dashboard")}
              disabled={saving}
              className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              Return to Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}