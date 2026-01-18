import React from "react";
import { Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { ArrowLeft, Baby, Scale, Calendar } from "lucide-react";

export default function NutritionLogs({ child, logs }) {
    const getMuacColor = (status) => {
        switch (status) {
            case 'Normal': return 'bg-green-100 text-green-800';
            case 'MAM': return 'bg-yellow-100 text-yellow-800';
            case 'SAM': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <PhcStaffLayout header={`Nutrition Logs: ${child.child_name}`}>
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={route("phc.children.show", child.id)}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                    >
                        <ArrowLeft size={20} />
                        Back to Child Profile
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full ${child.sex === 'Male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                            <Baby className={`h-8 w-8 ${child.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{child.child_name}</h1>
                            <p className="text-gray-600">Nutrition History</p>
                        </div>
                    </div>
                </div>

                {logs.data?.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <Scale className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No nutrition logs recorded</h3>
                        <p className="text-gray-600">
                            Record the first nutrition visit for this child.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Age</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Weight</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Height</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">MUAC</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Supplements</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data?.map((log, index) => (
                                    <tr key={log.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                {log.visit_date}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">{log.age_in_months} months</td>
                                        <td className="py-4 px-6">{log.weight} kg</td>
                                        <td className="py-4 px-6">{log.height ? `${log.height} cm` : '-'}</td>
                                        <td className="py-4 px-6">{log.muac ? `${log.muac} cm` : '-'}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMuacColor(log.muac_status)}`}>
                                                {log.muac_status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                {log.vitamin_a_given && (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Vit A</span>
                                                )}
                                                {log.deworming_given && (
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Deworm</span>
                                                )}
                                                {log.iron_supplement_given && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Iron</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.links && logs.last_page > 1 && (
                            <div className="flex justify-center gap-2 p-4 border-t">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => link.url && router.get(link.url)}
                                        disabled={!link.url}
                                        className={`px-4 py-2 rounded ${
                                            link.active
                                                ? 'bg-emerald-600 text-white'
                                                : link.url
                                                ? 'bg-white text-gray-700 hover:bg-gray-100 border'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PhcStaffLayout>
    );
}
