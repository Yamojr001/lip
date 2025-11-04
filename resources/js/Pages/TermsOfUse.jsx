import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function TermsOfUse({ appName = "Lafiyar Iyali" }) {
    return (
        <GuestLayout appName={appName}>
            <Head title="Terms of Use" />
            <div className="min-h-screen bg-[#faf6ff] text-gray-900 font-sans py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <header className="mb-8 text-center">
                        <h1 className="text-3xl lg:text-4xl font-bold text-[#5B2D91] mb-4">
                            Terms and Conditions of Use
                        </h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Last Updated: {new Date().getFullYear()}
                        </p>
                    </header>
                    
                    {/* Terms Content */}
                    <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg space-y-8">
                        {/* Introduction */}
                        <div className="text-center border-b border-gray-200 pb-6">
                            <p className="text-gray-700 leading-relaxed">
                                These Terms and Conditions apply to you, the user ("User"), and Lafiyar Iyali, 
                                the owner and operator of this web application ("Application"), a youth-led initiative 
                                under Actions for Peace and Better Health Initiative (e-CAPH), supported by LEAP Africa 
                                through the Nigeria Youth Futures Fund (NYFF).
                            </p>
                            <p className="text-gray-700 leading-relaxed mt-4 font-semibold">
                                By using this Application, you agree to be bound by the following Terms. If you do not 
                                agree with them, you should discontinue using the Application immediately.
                            </p>
                        </div>

                        {/* Section 1 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                1. About Lafiyar Iyali
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Lafiyar Iyali is a youth-driven initiative focused on reducing maternal and neonatal mortality 
                                in Kaduna State through the use of technology, data, and youth-led community advocacy. The program 
                                promotes safer pregnancies and deliveries by leveraging innovation, transparency, and community 
                                engagement to improve health outcomes for families.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                This Application serves as a digital platform for tracking maternal and neonatal health interventions, 
                                community advocacy reports, and other related initiatives to enhance transparency and accountability 
                                in healthcare delivery.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                2. Agreement
                            </h2>
                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-3">
                                <li className="leading-relaxed">
                                    By accessing and using this Application, you acknowledge that you have read, understood, 
                                    and agreed to the Terms of this Agreement.
                                </li>
                                <li className="leading-relaxed">
                                    If you do not agree with any part of these Terms, you must stop using the Application immediately.
                                </li>
                                <li className="leading-relaxed">
                                    Your participation and use of the Application signify your full acceptance of these Terms and Conditions.
                                </li>
                                <li className="leading-relaxed">
                                    By agreeing to these Terms, you represent that you are of legal age and have the capacity to enter into this Agreement.
                                </li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                3. Acceptable Use
                            </h2>
                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-3">
                                <li className="leading-relaxed">
                                    You are granted a limited, non-exclusive, non-transferable, and revocable license to use this 
                                    Application solely for personal and non-commercial purposes — including accessing health information, 
                                    community reports, and advocacy materials.
                                </li>
                                <li className="leading-relaxed">
                                    You agree not to misuse, modify, copy, distribute, or exploit any content or materials from the 
                                    Application for unlawful or unauthorized purposes.
                                </li>
                                <li className="leading-relaxed">
                                    Any unauthorized use of the Application or its materials shall result in the immediate termination 
                                    of your access rights.
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                4. User Account
                            </h2>
                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-3">
                                <li className="leading-relaxed">
                                    You may be required to register to access certain features or contribute data or reports.
                                </li>
                                <li className="leading-relaxed">
                                    You agree to provide accurate and complete information during registration and to keep your 
                                    login credentials secure.
                                </li>
                                <li className="leading-relaxed">
                                    You are responsible for maintaining the confidentiality of your account and for all activities 
                                    that occur under your account.
                                </li>
                                <li className="leading-relaxed">
                                    If you suspect that your account has been compromised, you must notify Lafiyar Iyali immediately.
                                </li>
                                <li className="leading-relaxed">
                                    The management reserves the right to suspend or terminate accounts found to be in violation of these Terms.
                                </li>
                            </ul>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                5. Privacy Policy
                            </h2>
                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-3">
                                <li className="leading-relaxed">
                                    To use this Application, certain personal information may be collected from you. By using the 
                                    Application, you consent to our collection and use of such information for operational, 
                                    communication, and reporting purposes.
                                </li>
                                <li className="leading-relaxed">
                                    Your personal data will be handled responsibly and in accordance with applicable data protection regulations.
                                </li>
                                <li className="leading-relaxed">
                                    Lafiyar Iyali reserves the right to deactivate or suspend any account found to be sharing false, 
                                    misleading, or harmful information.
                                </li>
                            </ul>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                6. Termination or Restriction of Access
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                Lafiyar Iyali reserves the right, at its sole discretion, to terminate your access to the Application 
                                and related services at any time, with or without notice, particularly in cases of misuse, misinformation, 
                                or non-compliance with these Terms.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                If you wish to deactivate your account, you may do so at any time by notifying us. Upon termination, 
                                your right to use the Application ceases immediately.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                7. Disclaimer
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                This Application is made possible through the generous support of LEAP Africa under the Nigeria 
                                Youth Futures Fund (NYFF).
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                The content and views expressed on this platform are solely those of Lafiyar Iyali and its 
                                implementing partners and do not necessarily reflect the views of LEAP Africa, the Ford Foundation, 
                                or MacArthur Foundation.
                            </p>
                        </section>

                        {/* Section 8 */}
                        <section className="space-y-4">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                8. General Provisions
                            </h2>
                            <ul className="list-disc list-inside ml-4 text-gray-700 space-y-3">
                                <li className="leading-relaxed">
                                    <strong>Assignment:</strong> Lafiyar Iyali may assign or transfer its rights and obligations 
                                    under these Terms. Users are not permitted to transfer their rights or obligations.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and 
                                    Lafiyar Iyali regarding the use of the Application.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Applicable Law:</strong> These Terms shall be governed by and construed in accordance 
                                    with the laws of the Federal Republic of Nigeria.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Amendments:</strong> Lafiyar Iyali reserves the right to modify or update these Terms 
                                    at any time. Continued use of the Application after such modifications constitutes acceptance 
                                    of the revised Terms.
                                </li>
                                <li className="leading-relaxed">
                                    <strong>Severability:</strong> If any part of these Terms is deemed invalid or unenforceable, 
                                    the remaining provisions shall remain in full effect.
                                </li>
                            </ul>
                        </section>

                        {/* Section 9 */}
                        <section className="space-y-4 bg-gray-50 p-6 rounded-lg">
                            <h2 className="text-xl lg:text-2xl font-semibold text-[#5B2D91] border-l-4 border-[#5B2D91] pl-4">
                                9. Contact Information
                            </h2>
                            <p className="text-gray-700 leading-relaxed">
                                For inquiries or support regarding this Application, please contact:
                            </p>
                            <div className="mt-4 space-y-2 text-gray-700">
                                <p className="font-semibold">Lafiyar Iyali – e-CAPH Initiative</p>
                                <p>Email: <a href="mailto:e-caph10@gmail.com" className="text-[#5B2D91] hover:underline">e-caph10@gmail.com</a></p>
                                <p>Address: No 1 Old Intercity Building, Intercity Street</p>
                                <p>Off Ahmadu Bello Way, Mogadishu City Centre Kaduna</p>
                                <p>Kaduna State, Nigeria.</p>
                            </div>
                        </section>

                        {/* Back to Home */}
                        <div className="text-center pt-6 border-t border-gray-200">
                            <Link 
                                href="/" 
                                className="inline-flex items-center text-[#5B2D91] hover:text-[#4a2380] font-medium transition"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}