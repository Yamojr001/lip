import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Syringe, Baby, Activity, TrendingUp, ArrowLeft, Download, Shield, CheckCircle } from 'lucide-react';

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

export default function ImmunizationStatistics() {
    const { immunizationData = {}, chartData = {}, statistics = {} } = usePage().props;

    const vaccineData = chartData.immunizationCoverage || [];

    const atBirthVaccines = [
        { name: 'BCG', received: immunizationData.bcg || 0 },
        { name: 'OPV0', received: immunizationData.opv0 || 0 },
        { name: 'HepB0', received: immunizationData.hepB0 || 0 },
    ];

    const sixWeekVaccines = [
        { name: 'Penta1', received: immunizationData.penta1 || 0 },
        { name: 'PCV1', received: immunizationData.pcv1 || 0 },
        { name: 'OPV1', received: immunizationData.opv1 || 0 },
        { name: 'Rota1', received: immunizationData.rota1 || 0 },
    ];

    const tenWeekVaccines = [
        { name: 'Penta2', received: immunizationData.penta2 || 0 },
        { name: 'PCV2', received: immunizationData.pcv2 || 0 },
        { name: 'OPV2', received: immunizationData.opv2 || 0 },
        { name: 'Rota2', received: immunizationData.rota2 || 0 },
    ];

    const fourteenWeekVaccines = [
        { name: 'Penta3', received: immunizationData.penta3 || 0 },
        { name: 'PCV3', received: immunizationData.pcv3 || 0 },
        { name: 'OPV3', received: immunizationData.opv3 || 0 },
        { name: 'IPV', received: immunizationData.ipv || 0 },
    ];

    const nineMonthVaccines = [
        { name: 'Measles1', received: immunizationData.measles1 || 0 },
        { name: 'Yellow Fever', received: immunizationData.yellowFever || 0 },
        { name: 'Vitamin A1', received: immunizationData.vitaminA1 || 0 },
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
                            <h1 className="text-3xl font-bold text-gray-900">Immunization Statistics</h1>
                            <p className="text-gray-600">Child Immunization Coverage Analysis</p>
                        </div>
                    </div>
                    <a href="/admin/vaccine-export" className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                        <Download size={16} />
                        Export Data
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Children" value={immunizationData.totalChildren || 0} icon={Baby} color="border-l-4 border-blue-600" />
                    <StatCard title="BCG Coverage" value={statistics.bcgImmunizationRate || 0} unit="%" icon={Syringe} color="border-l-4 border-green-600" />
                    <StatCard title="Fully Immunized" value={immunizationData.fullyImmunized || 0} icon={Shield} color="border-l-4 border-purple-600" />
                    <StatCard title="Pending Vaccines" value={immunizationData.pendingVaccines || 0} icon={Activity} color="border-l-4 border-yellow-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Vaccine Coverage by Antigen">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={vaccineData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    <ChartCard title="Coverage by Age Group">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={[
                                    { subject: 'At Birth', A: immunizationData.atBirthCoverage || 0 },
                                    { subject: '6 Weeks', A: immunizationData.sixWeekCoverage || 0 },
                                    { subject: '10 Weeks', A: immunizationData.tenWeekCoverage || 0 },
                                    { subject: '14 Weeks', A: immunizationData.fourteenWeekCoverage || 0 },
                                    { subject: '9 Months', A: immunizationData.nineMonthCoverage || 0 },
                                    { subject: '15 Months', A: immunizationData.fifteenMonthCoverage || 0 },
                                ]}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar name="Coverage %" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">At Birth Vaccines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {atBirthVaccines.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 bg-blue-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-600">{vaccine.received}</p>
                                <p className="text-sm text-gray-600">{vaccine.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">6 Weeks Vaccines</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sixWeekVaccines.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 bg-green-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-green-600">{vaccine.received}</p>
                                <p className="text-sm text-gray-600">{vaccine.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">10 Weeks Vaccines</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tenWeekVaccines.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 bg-purple-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-purple-600">{vaccine.received}</p>
                                <p className="text-sm text-gray-600">{vaccine.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">14 Weeks Vaccines</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fourteenWeekVaccines.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 bg-yellow-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-yellow-600">{vaccine.received}</p>
                                <p className="text-sm text-gray-600">{vaccine.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">9 Months Vaccines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {nineMonthVaccines.map((vaccine) => (
                            <div key={vaccine.name} className="p-4 bg-orange-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-orange-600">{vaccine.received}</p>
                                <p className="text-sm text-gray-600">{vaccine.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
