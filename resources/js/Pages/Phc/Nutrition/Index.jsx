import React from "react";
import { Head } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { Link } from "@inertiajs/react";

export default function NutritionIndex() {
    return (
        <PhcStaffLayout title="Nutrition Reports">
            <Head title="Nutrition Reports" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-6">Nutrition Monthly Reports</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">Create New Report</h3>
                                    <p className="text-green-600 mb-4">Submit monthly nutrition screening data</p>
                                    <Link
                                        href={route('phc.nutrition.reports.create')}
                                        className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                    >
                                        Create Report
                                    </Link>
                                </div>
                                
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-2">View Reports</h3>
                                    <p className="text-blue-600 mb-4">View and manage your submitted reports</p>
                                    <Link
                                        href="#"
                                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        View All Reports
                                    </Link>
                                </div>
                                
                                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Statistics</h3>
                                    <p className="text-purple-600 mb-4">View nutrition statistics and trends</p>
                                    <Link
                                        href="#"
                                        className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                                    >
                                        View Statistics
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold mb-4">Nutrition Reporting Guide</h3>
                                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                                    <li>Submit monthly nutrition screening data for children 6-59 months</li>
                                    <li>Track MAM (Moderate Acute Malnutrition) and SAM (Severe Acute Malnutrition) cases</li>
                                    <li>Monitor Vitamin A supplementation and Albendazole administration</li>
                                    <li>Track exclusive breastfeeding rates</li>
                                    <li>Report MIYCF (Maternal Infant and Young Child Feeding) counseling</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PhcStaffLayout>
    );
}