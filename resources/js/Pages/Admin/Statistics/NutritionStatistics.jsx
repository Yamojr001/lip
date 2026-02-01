import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Apple, Baby, Activity, TrendingUp, ArrowLeft, Download, AlertCircle, Scale, Filter as FilterIcon } from 'lucide-react';

const COLORS = ['#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#3b82f6'];

// Filter Component
const FilterSection = ({ filters, dropdowns, onFilterChange }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        if (key === 'lga_id') {
            newFilters.ward_id = 'all';
            newFilters.phc_id = 'all';
        } else if (key === 'ward_id') {
            newFilters.phc_id = 'all';
        }
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            lga_id: 'all',
            ward_id: 'all',
            phc_id: 'all',
            start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0]
        };
        setLocalFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const wardsInLGA = localFilters.lga_id !== 'all' 
        ? dropdowns.wards.filter(ward => ward.lga_id == localFilters.lga_id)
        : dropdowns.wards;

    const facilitiesInWard = localFilters.ward_id !== 'all'
        ? dropdowns.phcs.filter(phc => phc.ward_id == localFilters.ward_id)
        : dropdowns.phcs;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <FilterIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
                </div>
                <div className="flex space-x-2">
                    <button onClick={resetFilters} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Reset</button>
                    <button onClick={applyFilters} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Apply Filters</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                    <select value={localFilters.lga_id} onChange={(e) => handleFilterChange('lga_id', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="all">All LGAs</option>
                        {dropdowns.lgas.map(lga => <option key={lga.id} value={lga.id}>{lga.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                    <select value={localFilters.ward_id} onChange={(e) => handleFilterChange('ward_id', e.target.value)} disabled={localFilters.lga_id === 'all'} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                        <option value="all">All Wards</option>
                        {wardsInLGA.map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                    <select value={localFilters.phc_id} onChange={(e) => handleFilterChange('phc_id', e.target.value)} disabled={localFilters.ward_id === 'all'} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                        <option value="all">All Facilities</option>
                        {facilitiesInWard.map(phc => <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={localFilters.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={localFilters.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

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
    const { nutritionData = {}, statistics = {}, dropdowns = {}, filters: initialFilters = {} } = usePage().props;

    const handleFilterChange = (newFilters) => {
        router.get(route('admin.statistics.nutrition'), newFilters, { preserveState: true, replace: true });
    };

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

                <FilterSection filters={initialFilters} dropdowns={dropdowns} onFilterChange={handleFilterChange} />

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
