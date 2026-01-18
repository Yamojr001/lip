import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Landing({ appName = "Lafiyar Iyali" }) {
  return (
    <GuestLayout appName={appName}>
      {/* Hero Section */}
      <section className="flex-1 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 sm:px-6 lg:px-10 py-8 lg:py-20 max-w-7xl mx-auto min-h-[calc(100vh-76px)]">
        {/* Text Block */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 order-2 lg:order-1 text-center lg:text-left"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-gray-900">
            Empowering Communities for safe{" "}
            <span className="text-[#5B2D91] block lg:inline">Motherhood</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
           Lafiyar Iyali A youth-led initiative dedicated to enhancing communities Actions for peace and Better Health Initiative (e-caph), Supported By LEAP Africa Under the Nigeria Youth Futures Found [NYFF].
          </p>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
            The program Aims to reduce Maternal and neonantal mortatlity in Kaduna Through Technology, data, and Youth -driven community advocacy for safer pregnancies and delivery
         </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              href="/login"
              className="bg-[#5B2D91] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#4a2380] transition text-center"
            >
              Get Started
            </Link>
            <Link
              href="#about"
              className="border border-[#5B2D91] text-[#5B2D91] px-6 py-3 rounded-lg hover:bg-[#5B2D91] hover:text-white transition text-center"
            >
              Explore Features
            </Link>
          </div>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="flex justify-center order-1 lg:order-2 mt-4 lg:mt-0"
        >
          <img
            src="/phc2.png"
            alt="Maternal Health Care"
            className="w-full max-w-md lg:max-w-xl rounded-2xl shadow-lg"
          />

        </motion.div>
      </section>
      
      {/* Context Section */}
      <section id="context" className="py-12 lg:py-20 bg-gray-50 border-t border-purple-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-bold text-center text-[#5B2D91] mb-8 lg:mb-10"
          >
            Addressing Critical Health Gaps
          </motion.h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md space-y-3 border-t-4 border-red-500"
            >
              <h4 className="text-lg lg:text-xl font-semibold text-gray-800">Lack of Real-time Data</h4>
              <p className="text-gray-600 text-sm lg:text-base">
                Paper-based records delay reporting, making it difficult for supervisors to track maternal care indicators in real-time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md space-y-3 border-t-4 border-yellow-500"
            >
              <h4 className="text-lg lg:text-xl font-semibold text-gray-800">Poor Accountability</h4>
              <p className="text-gray-600 text-sm lg:text-base">
                Without digital tracking, monitoring the performance of individual PHC facilities and staff is cumbersome and often inefficient.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-md space-y-3 border-t-4 border-green-500 md:col-span-2 lg:col-span-1"
            >
              <h4 className="text-lg lg:text-xl font-semibold text-gray-800">Delayed Intervention</h4>
              <p className="text-gray-600 text-sm lg:text-base">
                Critical cases, like overdue deliveries or missed ANC appointments, are often identified too late, leading to poor outcomes.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 lg:py-20 bg-white border-t border-purple-100">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 sm:px-6 lg:px-10">
          <motion.img
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            src="phc.png"
            alt="ANC Tracking"
            className="rounded-2xl shadow-md w-full max-w-md mx-auto"
          />
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-5 text-center lg:text-left"
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-[#5B2D91]">
              About {appName}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
              {appName} ("Family Health" in Hausa) is a digital ANC data tracking system designed to empower PHC workers with real-time tools for recording and visualizing antenatal care statistics across wards and LGAs. It helps improve accountability and data-driven decision making.
            </p>
            <Link
              href="/register"
              className="inline-block mt-4 bg-[#5B2D91] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#4a2380] transition"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* More Section */}
      <section id="more" className="py-12 lg:py-20 bg-gray-50 border-t border-purple-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl lg:text-3xl font-bold text-[#5B2D91] mb-4"
          >
            Driving Better Outcomes
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto mb-8 lg:mb-10"
          >
            Our platform is designed to provide comprehensive data visibility, from the facility level all the way up to the LGA administration.
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 lg:p-8 rounded-xl shadow-lg border-l-8 border-[#5B2D91] space-y-4"
            >
              <h4 className="text-xl lg:text-2xl font-bold text-gray-800">For PHC Staff</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm lg:text-base">
                <li>Easy, quick digital registration of ANC and PNC data.</li>
                <li>Automated tracking of follow-up dates and overdue patients.</li>
                <li>Reduced administrative burden and paper work.</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 lg:p-8 rounded-xl shadow-lg border-l-8 border-green-600 space-y-4"
            >
              <h4 className="text-xl lg:text-2xl font-bold text-gray-800">For LGA Supervisors</h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm lg:text-base">
                <li>Instant, visualized reports on ANC and PNC coverage.</li>
                <li>Performance comparison across all managed PHCs.</li>
                <li>Data-driven allocation of resources and planning of interventions.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sponsored By Section */}
     {/* Sponsored By Section */}
<section className="py-12 lg:py-16 bg-white border-t border-purple-100">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
    <motion.h3
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-xl lg:text-2xl font-semibold text-gray-600 mb-8 lg:mb-12"
    >
      Sponsored By
    </motion.h3>
    
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center items-center gap-8 lg:gap-16"
    >
      {/* First Sponsor Logo */}
      <div className="flex flex-col items-center">
        <div className="rounded-full w-32 h-32 flex items-center justify-center overflow-hidden">
          <img 
            src="/kd.jpeg" 
            alt="LEAP Africa" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* <p className="mt-3 text-sm text-gray-600 font-medium">LEAP Africa</p> */}
      </div>

      {/* Second Sponsor Logo */}
      <div className="flex flex-col items-center">
        <div className=" w-45 h-32 flex items-center justify-center overflow-hidden">
          <img 
            src="/nf.jpeg" 
            alt="Nigeria Youth Futures Fund" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* <p className="mt-3 text-sm text-gray-600 font-medium">Nigeria Youth Futures Fund</p> */}
      </div>
    </motion.div>
  </div>
</section>
    </GuestLayout>
  );
}