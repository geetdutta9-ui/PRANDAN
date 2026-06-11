"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const getTimeAgo = (timestamp: any) => {
  if (!timestamp) return "";

  const now = new Date();
  const created = timestamp.toDate();

  const diffMinutes = Math.floor(
    (now.getTime() - created.getTime()) / 60000
  );

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);

  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

export default function ActiveSOS() {
  const router = useRouter();

  const [sosRequests, setSosRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOSRequests();
  }, []);

  const fetchSOSRequests = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        router.push("/user-login");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (!userData.isDonor) {
          alert("Only registered donors can view Active SOS Requests.");
          router.push("/user-dashboard");
          return;
        }
      }

      const q = query(
        collection(db, "sos_requests"),
        where("status", "==", "active")
      );

      const querySnapshot = await getDocs(q);
      const results: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        if (data.userId !== currentUser.uid) {
          results.push({
            id: doc.id,
            ...data,
          });
        }
      });
      results.sort(
  (a, b) =>
    (b.createdAt?.seconds || 0) -
    (a.createdAt?.seconds || 0)
);

      setSosRequests(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
        <p className="text-gray-700 font-semibold">Loading SOS Requests...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Active SOS Requests
            </h1>
            <p className="text-gray-600 mt-2 font-medium">
              Emergency blood requests currently active.
            </p>
          </div>
          <button
            onClick={() => router.push("/user-dashboard")}
            className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex justify-center items-center gap-2"
          >
            <span>&larr;</span> Dashboard
          </button>
        </div>

        {/* Content Section */}
        {sosRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[40vh]">
            <span className="text-5xl mb-4 opacity-80">📭</span>
            <h2 className="text-2xl font-bold text-gray-800">
              No Active SOS Requests
            </h2>
            <p className="text-gray-600 mt-2 max-w-md mx-auto font-medium">
              There are currently no emergency blood requests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sosRequests.map((sos) => (
              <div
                key={sos.id}
                className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-red-50 p-6 border-b border-red-100 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-3xl font-extrabold text-red-700 drop-shadow-sm">
                        🩸 {sos.bloodGroup}
                      </h2>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-gray-700">
                      Created:{" "}
                      {sos.createdAt
                        ? `${sos.createdAt.toDate().toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}, ${sos.createdAt.toDate().toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}`
                        : "N/A"}
                        <div className="text-xs text-red-600 font-semibold mt-1">
  Posted {getTimeAgo(sos.createdAt)}
</div>
                    </div>
                  </div>
                  
                  <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    ACTIVE
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-grow flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Patient Name" value={sos.patientName} />
                    <InfoRow label="Units Required" value={String(sos.unitsRequired)} />
                    <InfoRow label="Hospital" value={sos.hospitalName} />
                    <InfoRow label="District" value={sos.district} />
                    <InfoRow label="Contact Person" value={sos.contactPerson} />
                    <InfoRow label="Phone Number" value={sos.contactPhone} />
                  </div>

                  {sos.notes && (
                    <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-800 mb-1">
                        Additional Notes
                      </p>
                      <p className="text-gray-900 text-sm font-medium leading-relaxed">
                        {sos.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => router.push(`/sos-details/${sos.id}`)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold transition-colors duration-200 shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
        {label}
      </p>
      <p className="text-gray-900 font-extrabold truncate" title={value}>
        {value || "N/A"}
      </p>
    </div>
  );
}