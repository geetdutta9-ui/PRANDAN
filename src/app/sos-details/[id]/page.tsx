"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function SOSDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [sosData, setSOSData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSOS = async () => {
      try {
        const sosId = params.id as string;

        const docRef = doc(db, "sos_requests", sosId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSOSData({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSOS();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-700">
        Loading SOS Details...
      </div>
    );
  }

  if (!sosData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-red-600">
          SOS Request Not Found
        </h2>

        <button
          onClick={() => router.push("/active-sos")}
          className="mt-4 bg-red-600 text-white px-5 py-3 rounded-xl"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-black text-red-700">
              Emergency SOS Details
            </h1>

            <p className="text-gray-500 mt-2">
              Complete information about this blood request.
            </p>
          </div>

          <button
            onClick={() => router.push("/active-sos")}
            className="bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold"
          >
            ← Back
          </button>

        </div>

        {/* Status */}
        <div className="mb-8">

          <span className="bg-red-100 text-red-700 px-5 py-2 rounded-full font-bold">
            ACTIVE SOS REQUEST
          </span>

        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-5">

          <InfoCard
            title="Patient Name"
            value={sosData.patientName}
          />

          <InfoCard
            title="Blood Group"
            value={sosData.bloodGroup}
          />

          <InfoCard
            title="Units Required"
            value={String(sosData.unitsRequired)}
          />

          <InfoCard
            title="Hospital Name"
            value={sosData.hospitalName}
          />

          <InfoCard
            title="District"
            value={sosData.district}
          />

          <InfoCard
            title="State"
            value={sosData.state}
          />

          <InfoCard
            title="Contact Person"
            value={sosData.contactPerson}
          />

          <InfoCard
            title="Contact Number"
            value={sosData.contactPhone}
          />

        </div>

        {/* Notes */}
        {sosData.notes && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-5">

            <h3 className="font-bold text-lg text-gray-800 mb-3">
              Additional Notes
            </h3>

            <p className="text-gray-700">
              {sosData.notes}
            </p>

          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">

          <a
            href={`tel:${sosData.contactPhone}`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
          >
            📞 Call Now
          </a>

          <a
            href={`https://wa.me/91${sosData.contactPhone}`}
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            WhatsApp
          </a>

        </div>

      </div>

    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">

      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
        {title}
      </p>

      <p className="text-lg font-semibold text-gray-900">
        {value || "N/A"}
      </p>

    </div>
  );
}