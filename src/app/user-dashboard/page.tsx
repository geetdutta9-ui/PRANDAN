"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// ✅ Step 3: Added calculateAge function
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

export default function UserDashboard() {
  const router = useRouter();
  
  const [userName, setUserName] = useState("");
  const [isDonor, setIsDonor] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchType, setSearchType] = useState("banks"); 
  const [district, setDistrict] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [userDistrict, setUserDistrict] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [userAge, setUserAge] = useState(0);
  const [donorError, setDonorError] = useState("");
  const [activeSOSCount, setActiveSOSCount] = useState(0);
  const [bloodGroup, setBloodGroup] = useState("");

  const assamDistricts = [
    "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", 
    "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Goalpara", "Golaghat", 
    "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metro", "Karbi Anglong", 
    "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", 
    "Nalbari", "Sivasagar", "Sonitpur", "South Salmara", "Tinsukia", 
    "Udalguri", "West Karbi Anglong"
  ];

  // ✅ Auto-hide the donor error message after 5 seconds
  useEffect(() => {
    if (donorError) {
      const timer = setTimeout(() => {
        setDonorError("");
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [donorError]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/user-login");
        return;
      }
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();

          setUserName(userData.fullName || "");
          setIsDonor(userData.isDonor || false);

          // ✅ Step 2: Calculate and set the user's age
          const age = calculateAge(userData.dateOfBirth);
          setUserAge(age);

          const districtName = userData.district || "";

          setUserDistrict(districtName);
          setDistrict(districtName);

          if (districtName) {
  await loadDefaultBloodBanks(districtName);
}

await loadActiveSOSCount();
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ✅ Step 1: The floating, invalid block that caused crashes was completely removed from here.

  const loadDefaultBloodBanks = async (districtName: string) => {
    try {
      const q = query(
        collection(db, "blood_banks"),
        where("state", "==", "Assam"),
        where("district", "==", districtName)
      );

      const querySnapshot = await getDocs(q);

      const results: any[] = [];

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
    }
  };

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
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (!district) {
      setSearchMessage("Please select a district before searching.");
      return;
    }

    setIsSearching(true);
    setSearchMessage("");
    setHasSearched(true);
    searchResults.length = 0;

    try {
      const collectionName = searchType === "donors" ? "donors" : "blood_banks";
      
      let q;

      if (searchType === "donors" && bloodGroup) {
        q = query(
          collection(db, collectionName),
          where("state", "==", "Assam"),
          where("district", "==", district),
          where("bloodGroup", "==", bloodGroup)
        );
      } else {
        q = query(
          collection(db, collectionName),
          where("state", "==", "Assam"),
          where("district", "==", district)
        );
      }

      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      setSearchResults(results);
    } catch (error: any) {
      console.error("Search error:", error);
      setSearchMessage("Unable to fetch records. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600 mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Loading Dashboard...</p>
      </div>
    );
  }

  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-12">
      
      {/* FIX: Changed z-10 to z-50 to prevent scrolling overlap bugs */}
      {/* Polished Header */}
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

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {userName}.
            </h2>
            {isDonor && (
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold mb-4">
                🩸 Registered Blood Donor
              </div>
            )}
            <p className="text-gray-500 mb-8 max-w-lg">
              Thank you for being part of Prandan. We are dedicated to serving our community with free, reliable blood management services.
            </p>
            
            
            <div className="flex flex-wrap gap-4">
              {/* ✅ Step 4 & 5: Fixed Become Donor and Donor Profile buttons */}
              {!isDonor && (
  <button
    onClick={() => {
      if (userAge < 18) {
        setDonorError(
          "You are currently not eligible to become a blood donor. Minimum age requirement is 18 years."
        );
        return;
      }

      setDonorError("");
      router.push("/donor-register");
    }}
    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
  >
    Become a Donor
  </button>
)}
             
{isDonor && (
  <button
    onClick={() => router.push("/active-sos")}
    className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 px-6 py-3 rounded-xl font-semibold transition"
  >
    🚨 Active SOS Requests ({activeSOSCount})
  </button>
)}           <button
                onClick={() => router.push("/user-profile")}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                
                My Profile
              </button>

               <button
  onClick={() => router.push("/my-sos")}
  className="bg-red-50 text-red-700 border border-red-200 px-6 py-3 rounded-xl font-semibold"
>
  My SOS Requests
</button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>
            
            {/* Added Error Message UI here */}
            {donorError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium transition-opacity duration-300">
                ⚠️ {donorError}
              </div>
            )}
          </div>

          {/* Emergency Card */}
          <div className="bg-white border border-red-100 shadow-sm rounded-2xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-red-50 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                Need Blood Urgently?
              </h2>
              <p className="text-gray-600 mb-8 font-medium">
                Create an emergency SOS request to immediately notify nearby registered donors and blood banks.
              </p>
              <button 
                onClick={() => router.push("/emergency-sos")}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold tracking-wide px-8 py-5 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transform transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none animate-pulse"
              >
                CREATE EMERGENCY SOS
              </button>
            </div>
          </div>

        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Blood Availability Directory</h2>
              <p className="text-gray-500 mt-1">Search our network of registered donors and verified blood banks.</p>
            </div>
          </div>

          <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-8 w-full sm:w-auto">
            <button
              onClick={() => setSearchType('banks')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                searchType === 'banks' 
                  ? 'bg-white shadow text-red-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Blood Banks
            </button>
            <button
              onClick={() => setSearchType('donors')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                searchType === 'donors' 
                  ? 'bg-white shadow text-red-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Individual Donors
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                State
              </label>
              <input 
                type="text" 
                value="Assam" 
                readOnly 
                className="w-full border border-gray-200 bg-gray-50 text-base font-medium text-gray-500 rounded-xl px-4 py-3.5 outline-none cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                District
              </label>
              <select 
                value={district} 
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full border border-gray-300 bg-white text-base text-gray-900 font-medium rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow cursor-pointer"
              >
                <option value="">
                  {userDistrict
                    ? `Current District: ${userDistrict}`
                    : "Select District"}
                </option>
                {assamDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full border border-gray-300 bg-white text-base text-gray-900 font-medium rounded-xl px-4 py-3.5"
              >
                <option value="">All Groups</option>
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
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-base font-bold px-4 py-3.5 rounded-xl transition-colors shadow-sm"
              >
                {isSearching ? "Searching..." : "Search Directory"}
              </button>
            </div>

          </div>
        </div>

        {searchMessage && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-bold">
                  Notice
                </h3>
                <p className="text-sm">
                  {searchMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="space-y-6">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Search Results
              </h3>
              <span className="bg-red-50 text-red-700 font-extrabold px-4 py-1.5 rounded-lg text-sm border border-red-100">
                {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} Found
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
                <p className="text-gray-500 font-medium text-lg">No records found matching your search criteria.</p>
                <p className="text-sm text-gray-400 mt-2">Try selecting a different district or switching the category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {searchResults.map((result, index) => (
                  <div key={result.id} className="bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 hover:border-red-300 hover:shadow-lg transition-all duration-300 group flex flex-col lg:flex-row gap-8 lg:items-center">
                    
                    <div className="flex-1">
                      
                      {searchType === "donors" ? (
                        <div>
                          <div className="flex items-center mb-5">
                            <span className="bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-lg mr-4 text-sm">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-2xl text-gray-900 group-hover:text-red-700 transition-colors mr-4">{result.fullName}</h4>
                            <span className="bg-red-50 text-red-700 border border-red-100 font-bold px-3 py-1 rounded-lg text-sm">
                              {result.bloodGroup || "Unknown"}
                            </span>
                          </div>
                          <div className="space-y-3 text-base text-gray-600 pl-14">
                            <p className="flex items-center"><span className="font-medium text-gray-400 w-20">Phone</span> <span className="font-medium text-gray-900">{result.phone}</span></p>
                            <p className="flex items-center"><span className="font-medium text-gray-400 w-20">Location</span> <span className="font-medium text-gray-900">{result.district}, Assam</span></p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center mb-5">
                            <span className="bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-lg mr-4 text-sm">
                              #{index + 1}
                            </span>
                            <h4 className="font-bold text-2xl text-gray-900 group-hover:text-red-700 transition-colors">{result.bloodBankName}</h4>
                          </div>
                          <div className="space-y-3 text-base text-gray-600 pl-14">
                            <p className="flex items-center"><span className="font-medium text-gray-400 w-20">Phone</span> <span className="font-medium text-gray-900">{result.phone}</span></p>
                            <p className="flex items-center"><span className="font-medium text-gray-400 w-20">Email</span> <span className="font-medium text-gray-900 truncate">{result.email}</span></p>
                            <p className="flex items-center"><span className="font-medium text-gray-400 w-20">Location</span> <span className="font-medium text-gray-900">{result.district}, Assam</span></p>
                          </div>
                        </div>
                      )}

                    </div>

                    {searchType === "banks" && (
                      <div className="lg:w-[450px] shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-8">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Live Stock (Units)</p>
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { type: "A+", count: result.APlus || 0 },
                            { type: "A-", count: result.AMinus || 0 },
                            { type: "B+", count: result.BPlus || 0 },
                            { type: "B-", count: result.BMinus || 0 },
                            { type: "AB+", count: result.ABPlus || 0 },
                            { type: "AB-", count: result.ABMinus || 0 },
                            { type: "O+", count: result.OPlus || 0 },
                            { type: "O-", count: result.OMinus || 0 },
                          ].map((blood) => (
                            <div 
                              key={blood.type} 
                              className={`py-3 rounded-xl flex flex-col items-center justify-center border transition-colors ${
                                blood.count > 0 
                                  ? "bg-red-50 border-red-100 text-red-700" 
                                  : "bg-gray-50 border-gray-100 text-gray-400"
                              }`}
                            >
                              <span className="text-sm font-bold mb-0.5">{blood.type}</span>
                              <span className={`text-base ${blood.count > 0 ? "font-extrabold" : "font-medium"}`}>
                                {blood.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}