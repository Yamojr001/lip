import React, { useState, useEffect } from "react";
import { useForm, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { ArrowLeft, Save, Calculator } from "lucide-react";

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
        preferred_language: "",
        lga_id: "",
        ward_id: "",
        gravida: "",
        parity: "",
        age_of_pregnancy_weeks: "",
        date_of_registration: new Date().toISOString().split('T')[0],
        edd: "",
        fp_interest: "",
        blood_pressure: "",
        weight_kg: "",
        height_cm: "",
        blood_group: "",
        blood_level: "",
    });

    const sortedLgas = [...lgas].sort((a, b) => a.name.localeCompare(b.name));
    const filteredWards = wards.filter(w => w.lga_id === parseInt(data.lga_id)).sort((a, b) => a.name.localeCompare(b.name));

    const calculateEDD = () => {
        if (data.date_of_registration && data.age_of_pregnancy_weeks) {
            const regDate = new Date(data.date_of_registration);
            const weeksPregnant = parseInt(data.age_of_pregnancy_weeks);
            const weeksRemaining = 40 - weeksPregnant;
            const eddDate = new Date(regDate);
            eddDate.setDate(eddDate.getDate() + (weeksRemaining * 7));
            setData('edd', eddDate.toISOString().split('T')[0]);
        }
    };

    useEffect(() => {
        if (data.date_of_registration && data.age_of_pregnancy_weeks) {
            calculateEDD();
        }
    }, [data.date_of_registration, data.age_of_pregnancy_weeks]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.store'));
    };

    const InputField = ({ label, name, type = "text", required = false, options = null, placeholder = "", ...props }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            {options ? (
                <select value={data[name]} onChange={e => setData(name, e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required={required} {...props}>
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>)}
                </select>
            ) : (
                <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)} className="w-full border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" placeholder={placeholder} required={required} {...props} />
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <PhcStaffLayout title="Register New Patient">
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="mb-6 flex items-center justify-between">
                    <Link href={route('phc.dashboard')} className="flex items-center text-gray-600 hover:text-purple-600 transition">
                        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="p-8 space-y-8">
                        
                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">1. Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="Woman's Full Name" name="woman_name" required />
                                <InputField label="Age" name="age" type="number" required min="15" max="50" />
                                <InputField label="Can Read/Write?" name="literacy_status" required options={[
                                    { value: "Literate", label: "Yes (Literate)" },
                                    { value: "Not literate", label: "No (Not literate)" }
                                ]} />
                                <InputField label="Phone Number" name="phone_number" type="tel" required placeholder="08012345678" />
                                <InputField label="Preferred Language" name="preferred_language" placeholder="e.g., Hausa, English" />
                                <InputField label="Husband's Name" name="husband_name" />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">2. Location Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="LGA" name="lga_id" required options={sortedLgas.map(lga => ({ value: lga.id, label: lga.name }))} />
                                <InputField label="Ward" name="ward_id" required options={filteredWards.map(ward => ({ value: ward.id, label: ward.name }))} disabled={!data.lga_id} />
                                <InputField label="Community/Village" name="community" required placeholder="e.g., Ungogo Gabas" />
                                <div className="md:col-span-2">
                                    <InputField label="Residential Address" name="address" required placeholder="House/Street address" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">3. Pregnancy Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputField label="Gravida (Total Pregnancies)" name="gravida" type="number" required min="0" />
                                <InputField label="Parity (Past Births)" name="parity" type="number" required min="0" />
                                <InputField label="Pregnancy Age (Weeks)" name="age_of_pregnancy_weeks" type="number" required min="1" max="45" />
                                <InputField label="Registration Date" name="date_of_registration" type="date" required />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input type="date" value={data.edd} onChange={e => setData('edd', e.target.value)} className="flex-1 border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500" required />
                                        <button type="button" onClick={calculateEDD} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" title="Auto-calculate EDD">
                                            <Calculator size={18} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Week {data.age_of_pregnancy_weeks || '?'} of 40</p>
                                    {errors.edd && <p className="text-red-500 text-xs mt-1">{errors.edd}</p>}
                                </div>
                                <InputField label="Interested in Family Planning?" name="fp_interest" required options={["Yes", "No"]} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-purple-700 mb-4 border-b pb-2">4. Vital Signs (Optional)</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                <InputField label="Blood Pressure" name="blood_pressure" placeholder="e.g., 120/80" />
                                <InputField label="Weight (kg)" name="weight_kg" type="number" step="0.1" min="20" max="200" />
                                <InputField label="Height (cm)" name="height_cm" type="number" step="0.1" min="100" max="250" />
                                <InputField label="Blood Group" name="blood_group" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]} />
                                <InputField label="Blood Level (g/dL)" name="blood_level" type="number" step="0.1" min="0" max="20" placeholder="e.g., 12.5" />
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
