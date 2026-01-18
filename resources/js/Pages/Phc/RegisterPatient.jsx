import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { ArrowLeft, UserPlus, Save } from "lucide-react";

export default function RegisterPatient({ lgas, wards, phcFacilities }) {
    const { data, setData, post, processing, errors } = useForm({
        woman_name: "",
        age: "",
        literacy_status: "",
        phone_number: "",
        husband_name: "",
        husband_phone: "",
        address: "",
        community: "",
        lga_id: "",
        ward_id: "",
        health_facility_id: "",
        gravida: "",
        parity: "",
        age_of_pregnancy_weeks: "",
        date_of_registration: new Date().toISOString().split('T')[0],
        edd: "",
        fp_interest: "",
    });

    const filteredWards = wards.filter(w => w.lga_id === parseInt(data.lga_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.store'));
    };

    return (
        <PhcStaffLayout title="Register New Patient">
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={route('phc.dashboard')} className="flex items-center text-gray-600 hover:text-purple-600 transition">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 space-y-8">
                        {/* Section 1: Personal Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">1. Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Woman's Full Name *</label>
                                    <input type="text" value={data.woman_name} onChange={e => setData('woman_name', e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
                                    {errors.woman_name && <p className="text-red-500 text-xs mt-1">{errors.woman_name}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                                        <input type="number" value={data.age} onChange={e => setData('age', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Literacy Status *</label>
                                        <select value={data.literacy_status} onChange={e => setData('literacy_status', e.target.value)} className="w-full border-gray-300 rounded-lg" required>
                                            <option value="">Select</option>
                                            <option value="Literate">Literate</option>
                                            <option value="Illiterate">Illiterate</option>
                                            <option value="Not sure">Not sure</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input type="tel" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Husband's Phone</label>
                                    <input type="tel" value={data.husband_phone} onChange={e => setData('husband_phone', e.target.value)} className="w-full border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Community *</label>
                                    <input type="text" value={data.community} onChange={e => setData('community', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Facility *</label>
                                    <select value={data.health_facility_id} onChange={e => setData('health_facility_id', e.target.value)} className="w-full border-gray-300 rounded-lg" required>
                                        <option value="">Select Facility</option>
                                        {phcFacilities.filter(f => f.ward_id === parseInt(data.ward_id)).map(phc => (
                                            <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">2. Location Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
                                    <select value={data.lga_id} onChange={e => setData('lga_id', e.target.value)} className="w-full border-gray-300 rounded-lg" required>
                                        <option value="">Select LGA</option>
                                        {lgas.map(lga => <option key={lga.id} value={lga.id}>{lga.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
                                    <select value={data.ward_id} onChange={e => setData('ward_id', e.target.value)} className="w-full border-gray-300 rounded-lg" required disabled={!data.lga_id}>
                                        <option value="">Select Ward</option>
                                        {filteredWards.map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
                                    <textarea value={data.address} onChange={e => setData('address', e.target.value)} className="w-full border-gray-300 rounded-lg" rows="2" required></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Medical History */}
                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">3. Pregnancy & Medical Info</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gravida (Total Pregnancies) *</label>
                                    <input type="number" value={data.gravida} onChange={e => setData('gravida', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Parity (Number of Births) *</label>
                                    <input type="number" value={data.parity} onChange={e => setData('parity', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pregnancy Age (Weeks) *</label>
                                    <input 
                                        type="number" 
                                        value={data.age_of_pregnancy_weeks} 
                                        onChange={e => {
                                            const weeks = e.target.value;
                                            setData('age_of_pregnancy_weeks', weeks);
                                            if (weeks && weeks > 0) {
                                                const eddDate = new Date();
                                                eddDate.setDate(eddDate.getDate() + (40 - weeks) * 7);
                                                setData(prev => ({
                                                    ...prev,
                                                    age_of_pregnancy_weeks: weeks,
                                                    edd: eddDate.toISOString().split('T')[0]
                                                }));
                                            }
                                        }} 
                                        className="w-full border-gray-300 rounded-lg" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label>
                                    <input type="date" value={data.date_of_registration} onChange={e => setData('date_of_registration', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">EDD (Expected Delivery) *</label>
                                    <input type="date" value={data.edd} onChange={e => setData('edd', e.target.value)} className="w-full border-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Interested in FP? *</label>
                                    <select value={data.fp_interest} onChange={e => setData('fp_interest', e.target.value)} className="w-full border-gray-300 rounded-lg" required>
                                        <option value="">Select</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-6 flex items-center justify-end border-t border-gray-100">
                        <button type="submit" disabled={processing} className="flex items-center px-8 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg disabled:opacity-50">
                            {processing ? 'Registering...' : (
                                <>
                                    <Save size={20} className="mr-2" />
                                    Register Patient & Generate ID
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </PhcStaffLayout>
    );
}
