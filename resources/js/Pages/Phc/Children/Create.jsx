import React from "react";
import { useForm, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { ArrowLeft, Baby } from "lucide-react";

export default function CreateChild({ lgas, wards, patient }) {
    const { data, setData, post, processing, errors } = useForm({
        patient_id: patient?.id || '',
        lga_id: patient?.lga_id || '',
        ward_id: patient?.ward_id || '',
        child_name: '',
        date_of_birth: '',
        sex: '',
        birth_weight: '',
        place_of_birth: '',
        mother_name: patient?.woman_name || '',
        mother_phone: patient?.phone_number || '',
        father_name: patient?.husband_name || '',
        father_phone: patient?.husband_phone || '',
        address: patient?.address || '',
        community: patient?.community || '',
    });

    const filteredWards = wards.filter(w => w.lga_id === parseInt(data.lga_id));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.children.store'));
    };

    return (
        <PhcStaffLayout header="Register Child">
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={patient ? route("phc.patient.dashboard", patient.id) : route("phc.children.index")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-blue-100 rounded-full">
                            <Baby className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Register New Child</h1>
                            <p className="text-gray-600">Enter child and parent details</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Child Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Child Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.child_name}
                                        onChange={(e) => setData('child_name', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    />
                                    {errors.child_name && <p className="text-red-500 text-sm mt-1">{errors.child_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    />
                                    {errors.date_of_birth && <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sex <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.sex}
                                        onChange={(e) => setData('sex', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    >
                                        <option value="">Select Sex</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.birth_weight}
                                        onChange={(e) => setData('birth_weight', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        placeholder="e.g., 3.2"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                                    <input
                                        type="text"
                                        value={data.place_of_birth}
                                        onChange={(e) => setData('place_of_birth', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        placeholder="Hospital or location name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        LGA <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.lga_id}
                                        onChange={(e) => {
                                            setData('lga_id', e.target.value);
                                            setData('ward_id', '');
                                        }}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    >
                                        <option value="">Select LGA</option>
                                        {lgas.map((lga) => (
                                            <option key={lga.id} value={lga.id}>{lga.name}</option>
                                        ))}
                                    </select>
                                    {errors.lga_id && <p className="text-red-500 text-sm mt-1">{errors.lga_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ward <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={data.ward_id}
                                        onChange={(e) => setData('ward_id', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                        disabled={!data.lga_id}
                                    >
                                        <option value="">Select Ward</option>
                                        {filteredWards.map((ward) => (
                                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                                        ))}
                                    </select>
                                    {errors.ward_id && <p className="text-red-500 text-sm mt-1">{errors.ward_id}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        rows="2"
                                        required
                                    />
                                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Community</label>
                                    <input
                                        type="text"
                                        value={data.community}
                                        onChange={(e) => setData('community', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Parent Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mother Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.mother_name}
                                        onChange={(e) => setData('mother_name', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    />
                                    {errors.mother_name && <p className="text-red-500 text-sm mt-1">{errors.mother_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mother Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.mother_phone}
                                        onChange={(e) => setData('mother_phone', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                        required
                                    />
                                    {errors.mother_phone && <p className="text-red-500 text-sm mt-1">{errors.mother_phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                                    <input
                                        type="text"
                                        value={data.father_name}
                                        onChange={(e) => setData('father_name', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Father Phone</label>
                                    <input
                                        type="tel"
                                        value={data.father_phone}
                                        onChange={(e) => setData('father_phone', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Link
                                href={patient ? route("phc.patient.dashboard", patient.id) : route("phc.children.index")}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                            >
                                {processing ? 'Registering...' : 'Register Child'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PhcStaffLayout>
    );
}
