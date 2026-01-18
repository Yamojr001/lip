import React from "react";
import { useForm, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { ArrowLeft, Baby } from "lucide-react";

export default function EditChild({ child, lgas, wards }) {
    const { data, setData, patch, processing, errors } = useForm({
        child_name: child.child_name || '',
        date_of_birth: child.date_of_birth || '',
        sex: child.sex || '',
        birth_weight: child.birth_weight || '',
        place_of_birth: child.place_of_birth || '',
        mother_name: child.mother_name || '',
        mother_phone: child.mother_phone || '',
        father_name: child.father_name || '',
        father_phone: child.father_phone || '',
        address: child.address || '',
        community: child.community || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('phc.children.update', child.id));
    };

    return (
        <PhcStaffLayout header={`Edit: ${child.child_name}`}>
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={route("phc.children.show", child.id)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                    >
                        <ArrowLeft size={20} />
                        Back to Child Profile
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-4 rounded-full ${child.sex === 'Male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                            <Baby className={`h-8 w-8 ${child.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Edit Child Details</h1>
                            <p className="text-gray-600">ID: {child.unique_id}</p>
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
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                                    <input
                                        type="text"
                                        value={data.place_of_birth}
                                        onChange={(e) => setData('place_of_birth', e.target.value)}
                                        className="w-full border rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                href={route("phc.children.show", child.id)}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PhcStaffLayout>
    );
}
