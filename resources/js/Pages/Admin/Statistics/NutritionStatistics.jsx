import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Apple, Baby, Activity, TrendingUp, ArrowLeft, Download, AlertCircle, Scale } from 'lucide-react';

const COLORS = ['#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#3b82f6'];

const StatCard = ({ title, value, unit = '', icon: Icon, color }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
            </div>
            <div className={`p-3 rounded-full ${color.replace('border-l-4 border-', 'bg-').replace('-600', '-100')}`}>
                <Icon className={`h-6 w-6 ${color.replace('border-l-4 border-', 'text-')}`} />
            </div>
        </div>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

export default function NutritionStatistics() {
    const { nutritionData = {}, statistics = {} } = usePage().props;

    const muacStatusData = [
        { name: 'Normal', value: nutritionData.normalCount || 0, fill: '#10b981' },
        { name: 'MAM', value: nutritionData.mamCount || 0, fill: '#fbbf24' },
        { name: 'SAM', value: nutritionData.samCount || 0, fill: '#ef4444' },
    ];

    const breastfeedingData = [
        { name: 'Exclusive BF', value: nutritionData.exclusiveBf || 0 },
        { name: 'BF + Water', value: nutritionData.bfWithWater || 0 },
        { name: 'Partial BF', value: nutritionData.partialBf || 0 },
        { name: 'Stopped BF', value: nutritionData.stoppedBf || 0 },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Nutrition Statistics</h1>
                            <p className="text-gray-600">Child Nutrition and Growth Monitoring</p>
                        </div>
                    </div>
                    <a href="/admin/patients/export" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} />
                        Export Data
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Children Assessed" value={nutritionData.totalAssessed || 0} icon={Baby} color="border-l-4 border-blue-600" />
                    <StatCard title="Normal Nutrition" value={nutritionData.normalCount || 0} icon={Activity} color="border-l-4 border-green-600" />
                    <StatCard title="MAM Cases" value={nutritionData.mamCount || 0} icon={AlertCircle} color="border-l-4 border-yellow-600" />
                    <StatCard title="SAM Cases" value={nutritionData.samCount || 0} icon={Scale} color="border-l-4 border-red-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Nutritional Status Distribution (MUAC)">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={muacStatusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                                        {muacStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Breastfeeding Practices">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={breastfeedingData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Supplements & Interventions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-orange-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-orange-600">{nutritionData.vitaminAGiven || 0}</p>
                            <p className="text-sm text-gray-600">Vitamin A Given</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-purple-600">{nutritionData.dewormingGiven || 0}</p>
                            <p className="text-sm text-gray-600">Deworming Given</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-red-600">{nutritionData.ironGiven || 0}</p>
                            <p className="text-sm text-gray-600">Iron Supplement</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600">{nutritionData.referredForTreatment || 0}</p>
                            <p className="text-sm text-gray-600">Referred for Treatment</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">CMAM (Community-based Management of Acute Malnutrition)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-yellow-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-yellow-600">{nutritionData.cmamReferred || 0}</p>
                            <p className="text-sm text-gray-600">Referred to CMAM</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-green-600">{nutritionData.cmamAdmitted || 0}</p>
                            <p className="text-sm text-gray-600">Admitted to CMAM</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600">{nutritionData.samRecovered || 0}</p>
                            <p className="text-sm text-gray-600">SAM Recovered</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-red-600">{nutritionData.samDefaulted || 0}</p>
                            <p className="text-sm text-gray-600">SAM Defaulted</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Age Group Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600">{nutritionData.age0to5 || 0}</p>
                            <p className="text-sm text-gray-600">0-5 Months</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-green-600">{nutritionData.age6to11 || 0}</p>
                            <p className="text-sm text-gray-600">6-11 Months</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-purple-600">{nutritionData.age12to59 || 0}</p>
                            <p className="text-sm text-gray-600">12-59 Months</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
