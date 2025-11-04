import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function ViewPhcs({ phcs = [], appName = "Lafiyar Iyali" }) {
    console.log('PHCs data:', phcs); // Add this for debugging

    return (
        <GuestLayout appName={appName}>
            <Head title="View PHCs" />
            <div className="min-h-screen bg-[#faf6ff] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl lg:text-4xl font-bold text-[#5B2D91] mb-4">
                            Primary Health Care Centers
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Browse through our network of Primary Health Care centers providing maternal and child health services across Kaduna State.
                        </p>
                    </div>

                    {/* PHC Cards Grid */}
                    {phcs && phcs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                            {phcs.map((phc) => (
                                <div
                                    key={phc.id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-purple-100"
                                >
                                    {/* PHC Image */}
                                    <div className="h-48 bg-gradient-to-br from-purple-100 to-[#5B2D91] flex items-center justify-center">
                                        {phc.images && phc.images.length > 0 ? (
                                            <img
                                                src={phc.images[0]}
                                                alt={phc.clinic_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-white text-center">
                                                <svg className="w-16 h-16 mx-auto mb-2 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6zm2 2h4a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-sm font-medium">No Image Available</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* PHC Details */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                            {phc.clinic_name}
                                        </h3>

                                        {/* Location - FIXED: Direct access to strings */}
                                        <div className="flex items-center text-gray-600 mb-3">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">
                                                {phc.ward}, {phc.lga}
                                            </span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start text-gray-600 mb-3">
                                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm line-clamp-2">{phc.address}</span>
                                        </div>

                                        {/* Incharge */}
                                        <div className="flex items-center text-gray-600 mb-3">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Incharge: {phc.incharge_name}</span>
                                        </div>

                                        {/* Contact */}
                                        <div className="flex items-center text-gray-600 mb-4">
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">{phc.contact_phone}</span>
                                        </div>

                                        {/* ANC Schedule - FIXED: Handle array format */}
                                        {phc.anc_schedule && Array.isArray(phc.anc_schedule) && phc.anc_schedule.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-800 mb-2">ANC Schedule</h4>
                                                <div className="space-y-1">
                                                    {phc.anc_schedule.map((schedule, index) => (
                                                        <div key={index} className="flex justify-between text-xs text-gray-600">
                                                            <span className="capitalize">{schedule.day}:</span>
                                                            <span>{schedule.time_from} - {schedule.time_to}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex space-x-3 pt-4 border-t border-gray-100">
                                            <Link
                                                href={`/phcs/${phc.id}`}
                                                className="flex-1 bg-[#5B2D91] text-white text-center py-2 px-4 rounded-lg hover:bg-[#4a2380] transition text-sm font-medium"
                                            >
                                                View Details
                                            </Link>
                                            {phc.email && (
                                                <a
                                                    href={`mailto:${phc.email}`}
                                                    className="flex items-center justify-center text-[#5B2D91] border border-[#5B2D91] py-2 px-4 rounded-lg hover:bg-[#5B2D91] hover:text-white transition text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                    </svg>
                                                    Email
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="text-2xl font-bold text-gray-600 mb-2">No PHCs Found</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                There are currently no Primary Health Care centers registered in the system.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center text-[#5B2D91] hover:text-[#4a2380] font-medium"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>
                        </div>
                    )}

                    {/* Stats */}
                    {phcs && phcs.length > 0 && (
                        <div className="mt-12 text-center">
                            <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg">
                                <span className="text-gray-600 mr-2">Total PHCs:</span>
                                <span className="text-2xl font-bold text-[#5B2D91]">{phcs.length}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}