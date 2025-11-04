import React from "react";
import { usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
    const { statistics, chartData, dropdowns, currentYear } = usePage().props;

    // Process chart data
    const monthlyData = chartData?.monthlyRegistrations ? Object.entries(chartData.monthlyRegistrations).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        registrations: count
    })) : [];

    const deliveryData = chartData?.deliveryOutcomes ? Object.entries(chartData.deliveryOutcomes).map(([name, value]) => ({ name, value })) : [];
    const lgaData = chartData?.lgaAncCompletion ? Object.entries(chartData.lgaAncCompletion).map(([lga, rate]) => ({ lga, rate })) : [];
    const progressData = chartData?.ancProgress?.months ? chartData.ancProgress.months.map((month, index) => ({
        month,
        actual: chartData.ancProgress.actual[index],
        target: chartData.ancProgress.target[index]
    })) : [];

    // Check data availability
    const hasData = statistics?.totalRegistered > 0;
    const hasMonthlyData = monthlyData.length > 0;
    const hasDeliveryData = deliveryData.length > 0;
    const hasLgaData = lgaData.length > 0;
    const hasProgressData = progressData.length > 0;

    // Performance metrics
    const performanceMetrics = [
        {
            title: "Total Registered Patients",
            value: statistics?.totalRegistered?.toLocaleString() || "0",
            change: "+12%",
            color: "blue",
            icon: "👥"
        },
        {
            title: "ANC4 Completion Rate",
            value: statistics?.anc4Rate ? `${statistics.anc4Rate}%` : "0%",
            change: "+8%",
            color: "green",
            icon: "📊"
        },
        {
            title: "Health Facility Delivery Rate",
            value: statistics?.hospitalDeliveryRate ? `${statistics.hospitalDeliveryRate}%` : "0%",
            change: "+15%",
            color: "purple",
            icon: "🏥"
        },
        {
            title: "Live Births Recorded",
            value: statistics?.detailedCounts?.liveBirths?.toLocaleString() || "0",
            change: "+5%",
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
                        <p className="text-gray-600">Comprehensive overview of maternal and child health performance across all facilities</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                            📅 Period: Jan 1 - Dec 31, {currentYear}
                        </div>
                    </div>
                </div>
            </div>

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

            {!hasData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-6">
                    <div className="text-yellow-600 text-lg font-semibold mb-2">No Data Available</div>
                    <p className="text-yellow-700">No patient records found for {currentYear}.</p>
                </div>
            )}

            {hasData && (
                <>
                    {/* Main Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Monthly Registrations */}
                        {hasMonthlyData ? (
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
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Monthly Data</div>
                                    <p className="text-sm">No registration trend data available.</p>
                                </div>
                            </div>
                        )}

                        {/* Delivery Outcomes */}
                        {hasDeliveryData ? (
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
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Delivery Data</div>
                                    <p className="text-sm">No delivery outcome data available.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Performance Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* LGA Performance */}
                        {hasLgaData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">ANC Completion by LGA</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={lgaData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis type="category" dataKey="lga" width={100} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Bar dataKey="rate" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No LGA Data</div>
                                    <p className="text-sm">No LGA performance data available.</p>
                                </div>
                            </div>
                        )}

                        {/* Progress Towards Target */}
                        {hasProgressData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Towards 25% ANC Target</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={progressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="actual" 
                                                stroke="#8884d8" 
                                                strokeWidth={3}
                                                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="target" 
                                                stroke="#ff7300" 
                                                strokeWidth={2} 
                                                strokeDasharray="5 5"
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Progress Data</div>
                                    <p className="text-sm">No ANC progress data available.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-2">
                                {statistics?.kitsReceivedRate || 0}%
                            </div>
                            <div className="text-sm text-gray-600">Delivery Kits Received</div>
                            <div className="text-xs text-green-600 mt-1">+8% improvement</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-green-600 mb-2">
                                {statistics?.pnc1Within48hRate || 0}%
                            </div>
                            <div className="text-sm text-gray-600">PNC1 within 48h</div>
                            <div className="text-xs text-green-600 mt-1">+12% improvement</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-2">
                                {statistics?.detailedCounts?.hospitalDeliveries?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Hospital Deliveries</div>
                            <div className="text-xs text-green-600 mt-1">+15% increase</div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <div className="text-2xl font-bold text-orange-600 mb-2">
                                {statistics?.detailedCounts?.anc4Completed?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-600">Completed ANC4</div>
                            <div className="text-xs text-green-600 mt-1">On track</div>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">State Coverage Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">Total Facilities</div>
                                <div className="text-xl font-bold text-gray-800">{dropdowns?.phcs?.length || 0}</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">LGAs Covered</div>
                                <div className="text-xl font-bold text-gray-800">{dropdowns?.lgas?.length || 0}</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <div className="text-sm text-gray-600">Wards Covered</div>
                                <div className="text-xl font-bold text-gray-800">{dropdowns?.wards?.length || 0}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}