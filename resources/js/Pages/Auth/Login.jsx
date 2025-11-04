import { Head, Link, useForm } from "@inertiajs/react";

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("login"));
  };

  return (
    <>
      <Head title="Login - Lafiyar Iyali" />

      <div className="min-h-screen flex flex-col md:flex-row bg-[#faf6ff]">
        {/* Left Section */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center p-10 bg-[#5B2D91] text-white">
          <h1 className="text-4xl font-extrabold mb-4">Lafiyar Iyali</h1>
          <p className="text-lg text-purple-100 max-w-md text-center">
            Welcome back 👋 Sign in to access the ANC Data Tracker dashboard
            and continue improving maternal health outcomes.
          </p>
          <img
            src="https://cdn3d.iconscout.com/3d/premium/thumb/pregnant-woman-healthcare-illustration-9799870-7919978.png"
            alt="Maternal Care Illustration"
            className="w-72 mt-8"
          />
        </div>

        {/* Right Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-[#5B2D91] text-center mb-6">
              Login to Your Account
            </h2>

            <form onSubmit={submit} className="space-y-5">
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

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#5B2D91] text-white py-2 rounded-lg font-semibold hover:bg-[#4a2380] transition"
              >
                {processing ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* <p className="text-center text-sm text-gray-600 mt-6">
              Don’t have an account?{" "}
              <Link
                href={route("register")}
                className="text-[#5B2D91] font-semibold hover:underline"
              >
                Register
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
}
