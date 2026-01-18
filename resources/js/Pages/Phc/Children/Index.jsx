import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { Search, Baby, Plus, Eye, Calendar, User, Activity } from "lucide-react";

export default function ChildrenIndex({ children, filters }) {
    const [search, setSearch] = useState(filters?.search || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("phc.children.index"), { search }, { preserveState: true });
    };

    const getNutritionColor = (status) => {
        switch (status) {
            case 'Normal': return 'bg-green-100 text-green-800';
            case 'MAM': return 'bg-yellow-100 text-yellow-800';
            case 'SAM': return 'bg-red-100 text-red-800';
            case 'Overweight': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <PhcStaffLayout header="Child Records">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Child Records</h1>
                        <p className="text-gray-600">Manage child health and nutrition records</p>
                    </div>
                    <Link
                        href={route("phc.children.create")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                        <Plus size={20} />
                        Register Child
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by child name, mother name, or phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {children.data?.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <Baby className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No children registered</h3>
                        <p className="text-gray-600 mb-6">
                            Start by registering a child to track their health and vaccinations.
                        </p>
                        <Link
                            href={route("phc.children.create")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            <Plus size={20} />
                            Register First Child
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {children.data?.map((child) => (
                            <div
                                key={child.id}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-4 rounded-full ${child.sex === 'Male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                            <Baby className={child.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'} size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold text-gray-800">{child.child_name}</h3>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                                    {child.unique_id}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-gray-400" />
                                                    <span>Born: {child.date_of_birth}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-400" />
                                                    <span>Mother: {child.mother_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Activity size={16} className="text-gray-400" />
                                                    <span className={`px-2 py-1 rounded-full text-xs ${getNutritionColor(child.nutrition_status)}`}>
                                                        {child.nutrition_status}
                                                    </span>
                                                </div>
                                            </div>
                                            {child.alert && (
                                                <div className="mt-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm inline-block">
                                                    {child.alert}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={route("phc.children.show", child.id)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                    >
                                        <Eye size={18} />
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {children.links && children.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {children.links.map((link, i) => (
                            <button
                                key={i}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={`px-4 py-2 rounded ${
                                    link.active
                                        ? 'bg-emerald-600 text-white'
                                        : link.url
                                        ? 'bg-white text-gray-700 hover:bg-gray-100'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PhcStaffLayout>
    );
}
