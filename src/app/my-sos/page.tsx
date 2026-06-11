"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function MySOS() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadSOS();
  }, []);

  const loadSOS = async () => {
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, "sos_requests"),
      where("userId", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    const data: any[] = [];

    snapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    setRequests(data);
  };

  const handleResolve = async (sosId: string) => {
    try {
      await updateDoc(doc(db, "sos_requests", sosId), {
        status: "resolved",
      });

      loadSOS();

      alert("SOS Request marked as resolved.");
    } catch (error) {
      console.error(error);
      alert("Failed to update SOS.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-red-700">
            My SOS Requests
          </h1>

          <button
            onClick={() => router.push("/user-dashboard")}
            className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold"
          >
            ← Dashboard
          </button>

        </div>

        {requests.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-3xl text-center shadow-sm">
            <p className="text-gray-500 text-lg font-medium">
              No SOS requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {requests.map((sos) => (
              <div
                key={sos.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 hover:border-red-300 hover:shadow-lg transition-all duration-300 flex flex-col gap-6 relative overflow-hidden group"
              >

                <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600"></div>

                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Blood Group */}
                  <div className="bg-red-50 border border-red-100 h-24 w-24 rounded-2xl flex items-center justify-center flex-shrink-0 ml-2">
                    <h2 className="text-4xl font-black text-red-700">
                      {sos.bloodGroup}
                    </h2>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Patient
                      </p>
                      <p className="font-semibold text-lg">
                        {sos.patientName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Hospital
                      </p>
                      <p className="font-semibold text-lg">
                        {sos.hospitalName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        District
                      </p>
                      <p className="font-semibold text-lg">
                        {sos.district}
                      </p>
                    </div>

                  </div>

                  {/* Status */}
                  <div>
                    <span
                      className={`px-5 py-2 rounded-xl font-bold uppercase text-sm ${
                        sos.status === "active"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {sos.status}
                    </span>
                  </div>

                </div>

                {/* Buttons */}
                <div className="flex flex-wrap gap-3">

                  {sos.status === "active" && (
                    <button
                      onClick={() => handleResolve(sos.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold"
                    >
                      Mark as Resolved
                    </button>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}