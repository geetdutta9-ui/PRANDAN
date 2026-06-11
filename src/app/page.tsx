import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="bg-red-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-bold">PRANDAN</h1>

        <div className="hidden md:flex gap-6 font-medium">
          <a href="#">Developed by Geetartha Dutta</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-red-50 py-24 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-red-700 mb-6">
          Every Drop Counts, Every Donor Matters
        </h1>

        <p className="text-xl text-gray-800 max-w-4xl mx-auto">
          Prandan connects users and blood banks through a secure platform for
blood availability search, donor discovery, and emergency blood requests.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button className="bg-red-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-800">
            Find Blood
          </button>

          <button className="border-2 border-red-700 text-red-700 px-8 py-3 rounded-lg font-semibold hover:bg-red-100">
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
          Why Choose Prandan?
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="p-6 rounded-xl shadow-lg border bg-white">
            <h3 className="text-xl font-semibold mb-3 text-red-700">
              Quick Blood Search
            </h3>

            <p className="text-gray-800">
              Search available blood donors and blood banks during emergencies.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg border bg-white">
            <h3 className="text-xl font-semibold mb-3 text-red-700">
              Verified Donor Network
            </h3>

            <p className="text-gray-800">
              Connect with registered and verified blood donors.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg border bg-white">
            <h3 className="text-xl font-semibold mb-3 text-red-700">
              Registered Blood Banks
            </h3>

            <p className="text-gray-800">
              Access trusted blood bank information and blood availability.
            </p>
          </div>

          <div className="p-6 rounded-xl shadow-lg border bg-white">
            <h3 className="text-xl font-semibold mb-3 text-red-700">
              Emergency Support
            </h3>

            <p className="text-gray-800">
              Submit urgent blood requests and reach nearby donors quickly.
            </p>
          </div>
        </div>
      </section>

      {/* Role Section */}
      <section className="bg-gray-100 py-20 px-6">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
          Access the Platform
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* User */}
          <div className="bg-white p-8 rounded-xl shadow-xl">
            <h3 className="text-2xl font-bold text-red-700 mb-4">
              User
            </h3>

            <p className="text-gray-800 mb-6">
              Search blood donors, blood banks and create blood requests.
            </p>

            <div className="space-y-3">
              <Link href="/user-register">
                <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium cursor-pointer">
                  User Registration
                </button>
              </Link>

              <Link href="/user-login">
                <button className="w-full border-2 border-red-700 text-red-700 py-3 rounded-lg font-medium cursor-pointer">
                  User Login
                </button>
              </Link>
            </div>
          </div>

          {/* Blood Bank */}
          <div className="bg-white p-8 rounded-xl shadow-xl">
            <h3 className="text-2xl font-bold text-red-700 mb-4">
              Blood Bank
            </h3>

            <p className="text-gray-800 mb-6">
              Manage blood inventory and respond to blood requests efficiently.
            </p>

            <div className="space-y-3">
              <Link href="/blood-bank-register">
                <button className="w-full bg-red-700 text-white py-3 rounded-lg font-medium cursor-pointer">
                  Blood Bank Registration
                </button>
              </Link>

              <Link href="/blood-bank-login">
                <button className="w-full border-2 border-red-700 text-red-700 py-3 rounded-lg font-medium cursor-pointer">
                  Blood Bank Login
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6 bg-white">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-14">
          How Prandan Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-5xl font-bold text-red-700 mb-4">1</div>
            <p className="text-gray-800">Get Started</p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-red-700 mb-4">2</div>
            <p className="text-gray-800">Find nearby donors and blood banks.</p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-red-700 mb-4">3</div>
            <p className="text-gray-800">Become a donor and help others.</p>
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold text-red-700 mb-4">4</div>
            <p className="text-gray-800">Help save lives.</p>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
<section className="bg-red-700 text-white py-16 px-6 text-center">
  <h2 className="text-4xl font-bold mb-4">
    Need Blood Urgently?
  </h2>

  <p className="text-lg mb-8">
    Create an emergency request and connect with donors immediately.
  </p>

  <Link href="/user-register">
    <button className="bg-white text-red-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition cursor-pointer">
      Emergency SOS (Registration Required)
    </button>
  </Link>
</section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 text-center">
        <h3 className="text-2xl font-bold mb-2">
          PRANDAN
        </h3>

        <p className="text-gray-300">
          Blood Donation and Management Platform
        </p>

        <p className="text-gray-500 text-sm mt-4">
          © 2026 Prandan. All Rights Reserved.
        </p>
      </footer>

    </main>
  );
}