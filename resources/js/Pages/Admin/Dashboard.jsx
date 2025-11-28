import React from "react";
import { usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

export default function Dashboard() {
    const { statistics, chartData, currentYear } = usePage().props;

    // Process chart data
    const monthlyData = chartData?.monthlyRegistrations ? Object.entries(chartData.monthlyRegistrations).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        registrations: count
    })) : [];

    const deliveryData = chartData?.deliveryOutcomes ? Object.entries(chartData.deliveryOutcomes).map(([name, value]) => ({ name, value })) : [];
    const ancCompletionData = chartData?.ancCompletion ? Object.entries(chartData.ancCompletion).map(([name, value]) => ({ name, value })) : [];
    const literacyData = chartData?.literacyStatus ? Object.entries(chartData.literacyStatus).map(([name, value]) => ({ name, value })) : [];
    const insuranceData = chartData?.insuranceStatus ? Object.entries(chartData.insuranceStatus).map(([name, value]) => ({ name, value })) : [];
    const hivData = chartData?.hivStatus ? Object.entries(chartData.hivStatus).map(([name, value]) => ({ name, value })) : [];
    const fpData = chartData?.familyPlanning ? Object.entries(chartData.familyPlanning).map(([name, value]) => ({ name, value })) : [];
    const immunizationData = chartData?.immunization ? Object.entries(chartData.immunization).map(([name, value]) => ({ name, value })) : [];

    // Service utilization data
    const serviceData = chartData?.serviceUtilization ? Object.entries(chartData.serviceUtilization).map(([service, count]) => ({
        service: service.replace(/_/g, ' '),
        count: count
    })) : [];

    // Check data availability
    const hasData = statistics?.totalRegistered > 0;

    // Performance metrics cards
    const performanceMetrics = [
        {
            title: "Total Registered Patients",
            value: statistics?.totalRegistered?.toLocaleString() || "0",
            change: statistics?.trends?.totalPatients ? `${statistics.trends.totalPatients > 0 ? '+' : ''}${statistics.trends.totalPatients}%` : "+0%",
            color: "blue",
            icon: "👥"
        },
        {
            title: "ANC4 Completion Rate",
            value: statistics?.anc4Rate ? `${statistics.anc4Rate}%` : "0%",
            change: statistics?.trends?.anc4Rate ? `${statistics.trends.anc4Rate > 0 ? '+' : ''}${statistics.trends.anc4Rate}%` : "+0%",
            color: "green",
            icon: "📊"
        },
        {
            title: "Health Facility Delivery Rate",
            value: statistics?.hospitalDeliveryRate ? `${statistics.hospitalDeliveryRate}%` : "0%",
            change: statistics?.trends?.facilityDeliveryRate ? `${statistics.trends.facilityDeliveryRate > 0 ? '+' : ''}${statistics.trends.facilityDeliveryRate}%` : "+0%",
            color: "purple",
            icon: "🏥"
        },
        {
            title: "Live Births Recorded",
            value: statistics?.detailedCounts?.liveBirths?.toLocaleString() || "0",
            change: statistics?.trends?.liveBirths ? `${statistics.trends.liveBirths > 0 ? '+' : ''}${statistics.trends.liveBirths}%` : "+0%",
            color: "orange",
            icon: "👶"
        }
    ];

    const getColorClass = (color) => {
        const colors = {
            blue: 'bg-blue-50 border-blue-500 text-blue-600',
            green: 'bg-green-50 border-green-500 text-green-600',
            purple: 'bg-purple-50 border-purple-500 text-purple-600',
            orange: 'bg-orange-50 border-orange-500 text-orange-600'
        };
        return colors[color] || colors.blue;
    };

    return (
        <AdminLayout title="State Performance Dashboard">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">State Performance Summary {currentYear}</h1>
                        <p className="text-gray-600">Comprehensive overview of maternal and child health performance across all facilities in the state</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                            📅 Period: Jan 1 - Dec 31, {currentYear}
                        </div>
                    </div>
                </div>
            </div>

            {!hasData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-6">
                    <div className="text-yellow-600 text-lg font-semibold mb-2">No Data Available</div>
                    <p className="text-yellow-700">No patient records found for {currentYear}.</p>
                </div>
            )}

            {hasData && (
                <>
                    {/* Performance KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {performanceMetrics.map((metric, index) => (
                            <div key={index} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${getColorClass(metric.color)}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold">{metric.value}</div>
                                        <div className="text-sm text-gray-600 mt-1">{metric.title}</div>
                                    </div>
                                    <div className="text-3xl">{metric.icon}</div>
                                </div>
                                <div className={`text-sm font-semibold mt-2 ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                    {metric.change} from last year
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ANC Completion Breakdown */}
                    <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">ANC Completion Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                                <div className="text-2xl font-bold text-blue-600">{statistics?.ancCompletion?.anc1Only || 0}</div>
                                <div className="text-sm text-gray-600">Completed ANC1 Only</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-green-50 border-green-200">
                                <div className="text-2xl font-bold text-green-600">{statistics?.ancCompletion?.anc2Only || 0}</div>
                                <div className="text-sm text-gray-600">Completed ANC2 Only</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                                <div className="text-2xl font-bold text-yellow-600">{statistics?.ancCompletion?.anc3Only || 0}</div>
                                <div className="text-sm text-gray-600">Completed ANC3 Only</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-purple-50 border-purple-200">
                                <div className="text-2xl font-bold text-purple-600">{statistics?.ancCompletion?.anc4Completed || 0}</div>
                                <div className="text-sm text-gray-600">Completed ANC4</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Monthly Registrations */}
                        {monthlyData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly ANC Registrations Trend</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="registrations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Delivery Outcomes */}
                        {deliveryData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Outcome Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={deliveryData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {deliveryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Service Utilization */}
                    {serviceData.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Utilization</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={serviceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Detailed Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                {statistics?.kitsReceivedRate || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Delivery Kits Received</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                                {statistics?.pnc1Within48hRate || 0}%
                            </div>
                            <div className="text-sm text-gray-600">PNC1 within 48h</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                                {statistics?.detailedCounts?.hospitalDeliveries?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Hospital Deliveries</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                                {statistics?.detailedCounts?.anc4Completed?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Completed ANC4</div>
                        </div>
                    </div>

                    {/* Additional Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        {/* Literacy Status */}
                        {literacyData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Literacy Status</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={literacyData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {literacyData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Insurance Status */}
                        {insuranceData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance Status</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={insuranceData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {insuranceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* HIV Status */}
                        {hivData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">HIV Testing Results</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={hivData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                dataKey="value"
                                            >
                                                {hivData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Family Planning and Immunization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Family Planning */}
                        {fpData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Planning Methods</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={fpData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis type="category" dataKey="name" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Immunization */}
                        {immunizationData.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Immunization Coverage</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={immunizationData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">State Coverage Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">Total Facilities</div>
                                <div className="text-xl font-bold text-gray-800">{statistics?.totalFacilities || 0}</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">LGAs Covered</div>
                                <div className="text-xl font-bold text-gray-800">{statistics?.totalLgas || 0}</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">Wards Covered</div>
                                <div className="text-xl font-bold text-gray-800">{statistics?.totalWards || 0}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}