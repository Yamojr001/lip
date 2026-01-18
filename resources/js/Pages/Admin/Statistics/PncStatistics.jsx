import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell
} from 'recharts';
import { Heart, Users, Activity, TrendingUp, ArrowLeft, Download, Baby, Stethoscope } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

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
    const { statistics = {}, pncData = {} } = usePage().props;

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
