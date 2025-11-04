import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("register"));
  };

  return (
    <>
      <Head title="Register - Lafiyar Iyali" />

      <div className="min-h-screen flex flex-col md:flex-row bg-[#faf6ff]">
        {/* Left Section */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-10 bg-[#5B2D91] text-white">
          <h1 className="text-4xl font-extrabold mb-4">Join Lafiyar Iyali</h1>
          <p className="text-lg text-purple-100 max-w-md text-center">
            Create your account to start managing ANC records and generate
            insights for better maternal care across PHCs.
          </p>
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/doctor-and-mother-illustration-9799861-7919974.png"
            alt="Register Illustration"
            className="w-72 mt-8"
          />
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#5B2D91] text-center mb-6">
              Create Your Account
            </h2>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B2D91]"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B2D91]"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B2D91]"
                />
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={data.password_confirmation}
                  onChange={(e) =>
                    setData("password_confirmation", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5B2D91]"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#5B2D91] text-white py-2 rounded-lg font-semibold hover:bg-[#4a2380] transition"
              >
                {processing ? "Creating Account…" : "Register"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                href={route("login")}
                className="text-[#5B2D91] font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
