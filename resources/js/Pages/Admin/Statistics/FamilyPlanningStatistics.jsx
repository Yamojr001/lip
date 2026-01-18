import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { Heart, Users, Activity, TrendingUp, ArrowLeft, Download, Pill } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042'];

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

export default function FamilyPlanningStatistics() {
    const { statistics = {}, chartData = {}, fpData = {} } = usePage().props;

    const fpMethodsData = chartData.familyPlanning || [];
    const fpTrendsData = fpData.monthlyTrends || [];

    return (
        <AdminLayout>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Family Planning Statistics</h1>
                            <p className="text-gray-600">Family Planning Service Analysis</p>
                        </div>
                    </div>
                    <a href="/admin/patients/export" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} />
                        Export Data
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total FP Users" value={fpData.totalUsers || statistics.fpUptake || 0} icon={Heart} color="border-l-4 border-pink-600" />
                    <StatCard title="FP Uptake Rate" value={statistics.fpUptakeRate || 0} unit="%" icon={Activity} color="border-l-4 border-purple-600" />
                    <StatCard title="New Acceptors" value={fpData.newAcceptors || 0} icon={Users} color="border-l-4 border-green-600" />
                    <StatCard title="Revisits" value={fpData.revisits || 0} icon={TrendingUp} color="border-l-4 border-blue-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="FP Methods Distribution">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={fpMethodsData} cx="50%" cy="50%" outerRadius={100} fill="#ec4899" dataKey="value" label>
                                        {fpMethodsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="FP Methods by Count">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={fpMethodsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">FP Methods Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {[
                            { label: 'Male Condom', key: 'Male Condom', color: 'bg-blue-50 text-blue-600' },
                            { label: 'Female Condom', key: 'Female Condom', color: 'bg-pink-50 text-pink-600' },
                            { label: 'Pill', key: 'Pill', color: 'bg-purple-50 text-purple-600' },
                            { label: 'Injectable', key: 'Injectable', color: 'bg-green-50 text-green-600' },
                            { label: 'Implant', key: 'Implant', color: 'bg-yellow-50 text-yellow-600' },
                            { label: 'IUD', key: 'IUD', color: 'bg-orange-50 text-orange-600' },
                            { label: 'Other', key: 'Other', color: 'bg-gray-100 text-gray-600' },
                        ].map((method) => (
                            <div key={method.key} className={`p-4 rounded-xl text-center ${method.color}`}>
                                <p className="text-2xl font-bold">{fpMethodsData.find(m => m.name === method.key)?.value || 0}</p>
                                <p className="text-sm">{method.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">FP Interest vs Uptake</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-purple-50 rounded-xl text-center">
                            <p className="text-3xl font-bold text-purple-600">{fpData.interestedCount || 0}</p>
                            <p className="text-sm text-gray-600">Expressed Interest</p>
                        </div>
                        <div className="p-6 bg-green-50 rounded-xl text-center">
                            <p className="text-3xl font-bold text-green-600">{fpData.totalUsers || 0}</p>
                            <p className="text-sm text-gray-600">Currently Using FP</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-xl text-center">
                            <p className="text-3xl font-bold text-blue-600">{statistics.fpUptakeRate || 0}%</p>
                            <p className="text-sm text-gray-600">Conversion Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
