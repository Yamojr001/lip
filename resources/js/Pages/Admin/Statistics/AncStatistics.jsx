import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Stethoscope, Users, Activity, TrendingUp, ArrowLeft, Download, Calendar } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

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

export default function AncStatistics() {
    const { statistics = {}, chartData = {}, lgas = [], facilities = [] } = usePage().props;

    const ancVisitsData = chartData.ancVisitCompletion || [];
    const hivStatusData = chartData.hivStatus || [];

    return (
        <AdminLayout>
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 rounded-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ANC Statistics</h1>
                            <p className="text-gray-600">Antenatal Care Service Analysis</p>
                        </div>
                    </div>
                    <a href="/admin/patients/export" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} />
                        Export Data
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Registrations" value={statistics.totalRegistered || 0} icon={Users} color="border-l-4 border-blue-600" />
                    <StatCard title="ANC4 Completion Rate" value={statistics.anc4Rate || 0} unit="%" icon={Stethoscope} color="border-l-4 border-green-600" />
                    <StatCard title="ANC8 Completion Rate" value={statistics.anc8Rate || 0} unit="%" icon={Activity} color="border-l-4 border-purple-600" />
                    <StatCard title="Pending ANC8" value={statistics.pendingAnc8 || 0} icon={TrendingUp} color="border-l-4 border-yellow-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="ANC Visit Completion by Visit Number">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ancVisitsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="HIV Testing Status">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={hivStatusData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                                        {hivStatusData.map((entry, index) => (
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">ANC Completion Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((visit) => (
                            <div key={visit} className="text-center p-4 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-purple-600">{statistics.ancVisitsBreakdown?.[`anc${visit}`] || 0}</p>
                                <p className="text-sm text-gray-600">ANC {visit}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">HIV Testing During ANC</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-blue-600">{chartData.hivStatus?.find(h => h.name === 'Total Tested')?.value || 0}</p>
                            <p className="text-sm text-gray-600">Total Tested</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-green-600">{chartData.hivStatus?.find(h => h.name === 'Negative')?.value || 0}</p>
                            <p className="text-sm text-gray-600">Negative</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-xl text-center">
                            <p className="text-2xl font-bold text-red-600">{chartData.hivStatus?.find(h => h.name === 'Positive')?.value || 0}</p>
                            <p className="text-sm text-gray-600">Positive</p>
                        </div>
                        <div className="p-4 bg-gray-100 rounded-xl text-center">
                            <p className="text-2xl font-bold text-gray-600">{chartData.hivStatus?.find(h => h.name === 'Not Tested')?.value || 0}</p>
                            <p className="text-sm text-gray-600">Not Tested</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
