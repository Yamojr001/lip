import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { Heart, Users, Activity, TrendingUp, ArrowLeft, Download, Baby, Stethoscope, Filter as FilterIcon } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

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

export default function PncStatistics() {
    const { statistics = {}, pncData = {}, dropdowns = {}, filters: initialFilters = {} } = usePage().props;

    const handleFilterChange = (newFilters) => {
        router.get(route('admin.statistics.pnc'), newFilters, { preserveState: true, replace: true });
    };

    const pncCompletionData = [
        { name: 'PNC1', value: pncData.pnc1_received || 0 },
        { name: 'PNC2', value: pncData.pnc2_received || 0 },
        { name: 'PNC3', value: pncData.pnc3_received || 0 },
    ];

    const maternalServices = pncData.maternalServices || {};
    const newbornServices = pncData.newbornServices || {};
    const complications = pncData.complications || {};

    return (
        <AdminLayout>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">PNC Statistics</h1>
                            <p className="text-gray-600">Postnatal Care Service Analysis</p>
                        </div>
                    </div>
                    <a href="/admin/patients/export" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} />
                        Export Data
                    </a>
                </div>

                <FilterSection filters={initialFilters} dropdowns={dropdowns} onFilterChange={handleFilterChange} />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Delivered" value={statistics.detailedCounts?.totalDelivered || 0} icon={Baby} color="border-l-4 border-pink-600" />
                    <StatCard title="PNC1 Completion Rate" value={statistics.pnc1CompletionRate || 0} unit="%" icon={Heart} color="border-l-4 border-purple-600" />
                    <StatCard title="PNC within 48hrs" value={statistics.detailedCounts?.pnc1Within48h || 0} icon={Activity} color="border-l-4 border-green-600" />
                    <StatCard title="Incomplete PNCs" value={statistics.incompletePNCs || 0} icon={TrendingUp} color="border-l-4 border-yellow-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="PNC Visit Completion">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pncCompletionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="PNC Visit Rates">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pncCompletionData} cx="50%" cy="50%" outerRadius={100} fill="#ec4899" dataKey="value" label>
                                        {pncCompletionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Maternal Care Services Provided</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Breastfeeding Counseling', key: 'breastfeeding', color: 'bg-pink-50 text-pink-600' },
                            { label: 'Nutrition Counseling', key: 'nutrition', color: 'bg-green-50 text-green-600' },
                            { label: 'Family Planning', key: 'fp', color: 'bg-purple-50 text-purple-600' },
                            { label: 'Blood Pressure Check', key: 'bp', color: 'bg-blue-50 text-blue-600' },
                            { label: 'Iron Folate Given', key: 'iron', color: 'bg-red-50 text-red-600' },
                            { label: 'Vitamin A Given', key: 'vitA', color: 'bg-orange-50 text-orange-600' },
                        ].map((service) => (
                            <div key={service.key} className={`p-4 rounded-xl text-center ${service.color}`}>
                                <p className="text-2xl font-bold">{pncData.maternalServices?.[service.key] || 0}</p>
                                <p className="text-sm">{service.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Newborn Care Services</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Temperature Check', key: 'temp', color: 'bg-teal-50 text-teal-600' },
                            { label: 'Weight Check', key: 'weight', color: 'bg-blue-50 text-blue-600' },
                            { label: 'Cord Check', key: 'cord', color: 'bg-purple-50 text-purple-600' },
                            { label: 'Skin Check', key: 'skin', color: 'bg-pink-50 text-pink-600' },
                            { label: 'Eye Check', key: 'eye', color: 'bg-green-50 text-green-600' },
                            { label: 'KMC Initiated', key: 'kmc', color: 'bg-yellow-50 text-yellow-600' },
                        ].map((service) => (
                            <div key={service.key} className={`p-4 rounded-xl text-center ${service.color}`}>
                                <p className="text-2xl font-bold">{pncData.newbornServices?.[service.key] || 0}</p>
                                <p className="text-sm">{service.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Neonatal Complications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Sepsis', key: 'sepsis' },
                            { label: 'Jaundice', key: 'jaundice' },
                            { label: 'Hypothermia', key: 'hypothermia' },
                            { label: 'Asphyxia', key: 'asphyxia' },
                            { label: 'Low Birth Weight', key: 'lbw' },
                        ].map((complication) => (
                            <div key={complication.key} className="p-4 bg-red-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-red-600">{pncData.complications?.[complication.key] || 0}</p>
                                <p className="text-sm text-gray-600">{complication.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
