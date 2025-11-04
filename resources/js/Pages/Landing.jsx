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
            src="data:image/jpeg;base64,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"
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
            src="https://cdn3d.iconscout.com/3d/premium/thumb/maternity-health-illustration-9823129-7969484.png"
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
        <div className="rounded-full w-32 h-32 flex items-center justify-center overflow-hidden">
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