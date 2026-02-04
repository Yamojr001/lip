import React, { useState, useEffect } from "react";
import { router, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { Search, User, Phone, MapPin, Calendar, Eye, Plus } from "lucide-react";

export default function PatientSearch({ patients, search }) {
    const [searchQuery, setSearchQuery] = useState(search || "");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery !== (search || "")) {
                router.get(route("phc.search"), { search: searchQuery }, { 
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("phc.search"), { search: searchQuery }, { preserveState: true });
    };

    return (
        <PhcStaffLayout header="Patient Search">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Find Patient</h1>
                    <p className="text-gray-600 mb-6">
                        Search for a patient by name, phone number, or ID to access their records
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Enter patient name, phone number, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {search && (
                    <div className="mb-4">
                        <p className="text-gray-600">
                            {patients.length > 0
                                ? `Found ${patients.length} patient(s) matching "${search}"`
                                : `No patients found matching "${search}"`}
                        </p>
                    </div>
                )}

                {patients.length === 0 && search && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <User className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No patients found</h3>
                        <p className="text-gray-600 mb-6">
                            No patient matches your search. Would you like to register a new patient?
                        </p>
                        <Link
                            href={route("phc.create-patient")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Plus size={20} />
                            Register New Patient
                        </Link>
                    </div>
                )}

                {patients.length > 0 && (
                    <div className="grid gap-4">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all border border-gray-100"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {patient.woman_name}
                                            </h3>
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                                {patient.unique_id}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} className="text-gray-400" />
                                                <span>{patient.phone_number || "No phone"}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>
                                                    {patient.lga?.name || "Unknown LGA"},{" "}
                                                    {patient.ward?.name || "Unknown Ward"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span>EDD: {patient.edd || "Not set"}</span>
                                            </div>
                                        </div>
                                        {patient.alert && (
                                            <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                                                {patient.alert}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Link
                                            href={route("phc.patient.dashboard", patient.id)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                        >
                                            <Eye size={18} />
                                            Open Dashboard
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!search && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8 text-center">
                        <Search className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                            Search for a patient
                        </h3>
                        <p className="text-gray-600">
                            Enter at least 2 characters to search by name, phone number, or patient ID
                        </p>
                    </div>
                )}
            </div>
        </PhcStaffLayout>
    );
}
