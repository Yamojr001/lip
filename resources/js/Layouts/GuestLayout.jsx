import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function GuestLayout({ children, appName = "Lafiyar Iyali" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6ff] text-gray-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 md:py-6 border-b border-purple-100 sticky top-0 z-30 bg-[#faf6ff]">
        {/* Logo and App Name */}
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3"
          >
            {/* Logo */}
            <img 
              src="/ecp.jpeg" 
              alt={`${appName} Logo`}
              className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
              onError={(e) => {
                // Fallback if image doesn't load
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzVCMkQ5MSIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkxJPC90ZXh0Pgo8L3N2Zz4K";
              }}
            />
            {/* App Name */}
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[#5B2D91]">
              {appName}
            </h1>
          </motion.div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 text-sm font-medium">
          <Link href="/terms-of-use" className="hover:text-[#5B2D91] transition">
            Terms of Use
          </Link>
          <Link href="/view-phcs" className="hover:text-[#5B2D91] transition">
            View PHCs
          </Link>
          <Link href="/login" className="hover:text-[#5B2D91] transition">
            Login
          </Link>
          <Link
            href="#about"
            className="bg-[#5B2D91] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#4a2380] transition text-sm"
          >
            Learn More
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-4">
          <Link href="/login" className="text-[#5B2D91] text-sm font-medium">
            Login
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-[#5B2D91] hover:bg-purple-50 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-white border-b border-purple-100 px-4 py-4"
        >
          <nav className="flex flex-col space-y-4">
            <Link 
              href="/terms-of-use" 
              className="hover:text-[#5B2D91] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Terms of Use
            </Link>
            <Link 
              href="/view-phcs" 
              className="hover:text-[#5B2D91] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              View PHCs
            </Link>

            <Link 
              href="#about"
              className="bg-[#5B2D91] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#4a2380] transition text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Learn More
            </Link>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 bg-[#5B2D91] text-center text-sm text-white">
        © {new Date().getFullYear()} {appName}. All rights reserved.
      </footer>
    </div>
  );
}