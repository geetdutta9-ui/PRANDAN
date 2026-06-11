import Link from "next/link";

export default function RegistrationSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">

        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-3xl text-green-600">✓</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Registration Successful
        </h1>

        <p className="text-gray-600 mb-8">
          Your account has been created successfully.
          <br />
          You may now proceed to the login page from the homepage.
        </p>

        <Link
          href="/"
          className="block w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition"
        >
          Return to Homepage
        </Link>

      </div>
    </div>
  );
}