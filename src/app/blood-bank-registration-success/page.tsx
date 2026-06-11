import Link from "next/link";

export default function BloodBankRegistrationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">

        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-3xl text-green-600">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Blood Bank Registered Successfully
        </h1>

        <p className="text-gray-600 mb-8">
          Your blood bank account has been created successfully.
          <br />
          Please login to continue.
        </p>

        <Link
          href="/blood-bank-login"
          className="block w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
        >
          Blood Bank Login
        </Link>

        <Link
          href="/"
          className="block mt-4 text-gray-600 hover:text-red-600"
        >
          Return to Homepage
        </Link>

      </div>
    </div>
  );
}