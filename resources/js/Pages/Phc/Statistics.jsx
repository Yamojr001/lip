import React from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { usePage, Link } from "@inertiajs/react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ArcElement, 
    BarElement, 
    Tooltip, 
    Legend,
    Title,
    Filler // Make sure Filler is registered for line charts with fill: true
} from 'chart.js';
import { 
    Users, TrendingUp, Stethoscope, Baby, Heart, Shield, Dna,
    FlaskConical, Hospital, Home, CheckCircle, XCircle, BookOpen, Clock
} from "lucide-react";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Title, Filler);

// Simple component for a statistic card
const StatCard = ({ title, value, unit, color, icon: Icon }) => (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${color}`}>
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
        {Icon && <Icon className={`absolute bottom-4 right-4 h-6 w-6 opacity-20 ${color.replace('border', 'text')}`} />}
    </div>
);

// Component for a chart placeholder (to visualize monthly registrations)
const MonthlyRegChart = ({ data, title }) => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    // Convert controller data array (month => count) to chart array (index => count)
    const chartDataArray = labels.map((_, index) => data[index + 1] || 0);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: `Registrations (${currentYear})`,
                data: chartDataArray,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: {display: true, text: title, font: { size: 16 }}}, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };

    return (
        <div className="h-64">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default function PhcStatistics() {
    const { phcStats = null } = usePage().props;

    // Destructure comprehensive phcStats, providing default values for safety
    const { 
        totalPatients = 0, 
        delivered = 0, 
        anc1Completed = 0, 
        anc4Completed = 0, 
        anc8Completed = 0, 
        liveBirths = 0, 
        stillbirths = 0, 
        miscarriages = 0,
        deliveryRate = 0, 
        facilityDeliveryRate = 0,
        anc1Rate = 0,
        anc4Rate = 0,
        anc8Rate = 0,
        monthlyRegistrations = {}, 
        deliveryOutcomes = {}, // { 'Live birth', 'Stillbirth', 'Miscarriage' }
        ancVisitsBreakdown = {}, // { anc1: count, ..., anc8: count, anc5plus: count }
        ancServiceCounts = {}, // { urinalysis: count, iron_folate: count, ... }
        hivTestResults = {}, // { 'Total Tested', 'Positive', 'Negative', 'Not Tested', 'Results Not Received' }
        pncVisitCompletion = {}, // { pnc1_received: count, pnc2_received: count, pnc3_received: count }
        pncIncompleteCount = 0,
        fpUptakeRate = 0,
        fpMethodsUsage = {}, // { 'Male Condom': count, 'Pill': count, ... }
        healthInsuranceEnrollment = {}, // { 'Enrolled', 'Not Enrolled', 'Kachima', 'NHIS', 'Others' }
        immunizationCoverageDetails = {}, // { 'bcg_received': {count, rate}, ... for ALL vaccines }
        literacyStatusDistribution = {}, // { 'Literate': count, 'Illiterate': count, 'Not sure': count }
        ageDistribution = {}, // { '0-19': count, '20-29': count, ... }
        deliveryTypeDistribution = {}, // { 'Normal': count, 'Cesarean Section': count, ... }
        deliveryKitsReceived = {} // { 'Yes': count, 'No': count }
    } = phcStats || {};

    // Data for Delivery Outcome Doughnut Chart
    const deliveryOutcomeChartData = {
        labels: ['Live birth', 'Stillbirth', 'Miscarriage', 'Unknown'],
        datasets: [
            {
                data: [
                    deliveryOutcomes['Live birth'] || 0,
                    deliveryOutcomes['Stillbirth'] || 0,
                    deliveryOutcomes['Miscarriage'] || 0,
                    Math.max(0, (delivered - (deliveryOutcomes['Live birth'] || 0) - (deliveryOutcomes['Stillbirth'] || 0) - (deliveryOutcomes['Miscarriage'] || 0)))
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#a1a1aa'],
                hoverBackgroundColor: ['#059669', '#dc2626', '#d97706', '#71717a'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    // ANC Visit Completion by Visit Number (Bar Chart)
    const ancVisitCompletionChartData = {
        labels: ['ANC1', 'ANC2', 'ANC3', 'ANC4', 'ANC5', 'ANC6', 'ANC7', 'ANC8'],
        datasets: [
            {
                label: 'Patients Completed',
                data: Array.from({ length: 8 }, (_, i) => ancVisitsBreakdown[`anc${i+1}`] || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
            },
        ],
    };

    // ANC Services Provided (Bar Chart)
    const ancServicesChartData = {
        labels: ['Urinalysis', 'Iron Folate', 'MMS', 'SP', 'SBA'],
        datasets: [
            {
                label: 'Services Provided',
                data: [
                    ancServiceCounts.urinalysis || 0,
                    ancServiceCounts.iron_folate || 0,
                    ancServiceCounts.mms || 0,
                    ancServiceCounts.sp || 0,
                    ancServiceCounts.sba || 0
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.8)', // Green
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
            },
        ],
    };

    // HIV Test Results Distribution (Doughnut Chart)
    const hivTestResultsChartData = {
        labels: ['Positive', 'Negative', 'Not Tested', 'Results Not Received'],
        datasets: [
            {
                data: [
                    hivTestResults.Positive || 0,
                    hivTestResults.Negative || 0,
                    hivTestResults['Not Tested'] || 0,
                    hivTestResults['Results Not Received'] || 0
                ],
                backgroundColor: ['#ef4444', '#10b981', '#f59e0b', '#a1a1aa'],
                hoverBackgroundColor: ['#dc2626', '#059669', '#d97706', '#71717a'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    // Family Planning Methods Usage (Bar Chart)
    const fpMethodsUsageChartData = {
        labels: Object.keys(fpMethodsUsage),
        datasets: [
            {
                label: 'Patients Using Method',
                data: Object.values(fpMethodsUsage),
                backgroundColor: 'rgba(139, 92, 246, 0.8)', // Purple
                borderColor: 'rgb(139, 92, 246)',
                borderWidth: 1,
            },
        ],
    };

    // Child Immunization Coverage (Bar Chart - all vaccines)
    const allImmunizationLabels = Object.keys(immunizationCoverageDetails).map(key => 
        key.replace(/_received/g, '').replace(/([A-Z])/g, ' $1').trim()
    );
    const allImmunizationData = Object.values(immunizationCoverageDetails).map(v => v.rate || 0);

    const allImmunizationChartData = {
        labels: allImmunizationLabels,
        datasets: [
            {
                label: 'Coverage (%)',
                data: allImmunizationData,
                backgroundColor: 'rgba(245, 158, 11, 0.8)', // Yellow-Orange
                borderColor: 'rgb(245, 158, 11)',
                borderWidth: 1,
            },
        ],
    };

    // PNC Visit Completion (Bar Chart)
    const pncCompletionChartData = {
        labels: ['PNC Visit 1', 'PNC Visit 2', 'PNC Visit 3'],
        datasets: [
            {
                label: 'Patients Completed',
                data: [
                    pncVisitCompletion.pnc1_received || 0,
                    pncVisitCompletion.pnc2_received || 0,
                    pncVisitCompletion.pnc3_received || 0,
                ],
                backgroundColor: 'rgba(236, 72, 153, 0.8)', // Pink
                borderColor: 'rgb(236, 72, 153)',
                borderWidth: 1,
            },
        ],
    };

    // Health Insurance Enrollment by Type (Doughnut Chart)
    const insuranceTypeLabels = Object.keys(healthInsuranceEnrollment).filter(key => key !== 'Enrolled' && key !== 'Not Enrolled');
    const insuranceTypeData = insuranceTypeLabels.map(key => healthInsuranceEnrollment[key] || 0);

    const healthInsuranceTypeChartData = {
        labels: insuranceTypeLabels,
        datasets: [
            {
                data: insuranceTypeData,
                backgroundColor: ['#4f46e5', '#3b82f6', '#06b6d4', '#14b8a6', '#84cc16'], // Various blues/greens
                hoverBackgroundColor: ['#4338ca', '#2563eb', '#0891b2', '#0d9488', '#65a30d'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    // Literacy Status Distribution (Doughnut Chart)
    const literacyStatusChartData = {
        labels: Object.keys(literacyStatusDistribution),
        datasets: [
            {
                data: Object.values(literacyStatusDistribution),
                backgroundColor: ['#6366f1', '#a855f7', '#ec4899'], // Purple, Indigo, Pink
                hoverBackgroundColor: ['#4f46e5', '#9333ea', '#db2777'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    // Age Distribution (Bar Chart)
    const ageDistributionChartData = {
        labels: Object.keys(ageDistribution),
        datasets: [
            {
                label: 'Number of Patients',
                data: Object.values(ageDistribution),
                backgroundColor: 'rgba(20, 184, 166, 0.8)', // Teal
                borderColor: 'rgb(20, 184, 166)',
                borderWidth: 1,
            },
        ],
    };

    // Delivery Type Distribution (Doughnut Chart)
    const deliveryTypeChartData = {
        labels: Object.keys(deliveryTypeDistribution),
        datasets: [
            {
                data: Object.values(deliveryTypeDistribution),
                backgroundColor: ['#60a5fa', '#f87171', '#fbbf24', '#a78bfa'], // Blue, Red, Yellow, Purple
                hoverBackgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };

    // Delivery Kits Received (Pie Chart)
    const deliveryKitsChartData = {
        labels: ['Received', 'Not Received'],
        datasets: [
            {
                data: [
                    deliveryKitsReceived.Yes || 0,
                    deliveryKitsReceived.No || 0
                ],
                backgroundColor: ['#10b981', '#ef4444'], // Green, Red
                hoverBackgroundColor: ['#059669', '#dc2626'],
                borderWidth: 2,
                borderColor: '#fff'
            },
        ],
    };


    // Common chart options for responsive design and legend
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const pieDoughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += context.parsed;
                        }
                        return label;
                    }
                }
            }
        }
    };
    
    // Ensure all stats are defined before rendering
    if (!phcStats || totalPatients === undefined) {
        return (
            <PhcStaffLayout title="Clinic Statistics">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading detailed statistics...</p>
                    </div>
                </div>
            </PhcStaffLayout>
        );
    }

    return (
        <PhcStaffLayout title="Clinic Statistics">
            <h2 className="text-3xl font-bold text-purple-700 mb-8 border-b pb-4">Detailed Performance Analytics</h2>
            
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Registered Patients" 
                    value={totalPatients} 
                    unit="" 
                    color="border-purple-600"
                    icon={Users}
                />
                <StatCard 
                    title="ANC1 Completion Rate" 
                    value={anc1Rate} 
                    unit="%" 
                    color="border-green-600"
                    icon={Stethoscope}
                />
                <StatCard 
                    title="ANC4 Completion Rate" 
                    value={anc4Rate} 
                    unit="%" 
                    color="border-blue-600"
                    icon={Stethoscope}
                />
                <StatCard 
                    title="ANC8 Completion Rate" 
                    value={anc8Rate} 
                    unit="%" 
                    color="border-indigo-600"
                    icon={Stethoscope}
                />
                <StatCard 
                    title="Health Facility Delivery Rate" 
                    value={facilityDeliveryRate} 
                    unit="%" 
                    color="border-teal-600"
                    icon={Hospital}
                />
                <StatCard 
                    title="Live Births Recorded" 
                    value={liveBirths} 
                    unit="" 
                    color="border-yellow-600"
                    icon={Baby}
                />
                <StatCard 
                    title="FP Uptake Rate" 
                    value={fpUptakeRate} 
                    unit="%" 
                    color="border-pink-600"
                    icon={Dna}
                />
                <StatCard 
                    title="HIV Positive Rate" 
                    value={hivTestResults.Positive ? Math.round((hivTestResults.Positive / hivTestResults['Total Tested']) * 100) : 0} 
                    unit="%" 
                    color="border-red-600"
                    icon={FlaskConical}
                />
                <StatCard 
                    title="Insurance Enrollment" 
                    value={healthInsuranceEnrollment.Enrolled ? Math.round((healthInsuranceEnrollment.Enrolled / totalPatients) * 100) : 0} 
                    unit="%" 
                    color="border-cyan-600"
                    icon={Shield}
                />
                <StatCard 
                    title="BCG Immunization" 
                    value={immunizationCoverageDetails.bcg_received?.rate || 0} 
                    unit="%" 
                    color="border-orange-600"
                    icon={CheckCircle}
                />
                <StatCard 
                    title="PNC1 Completion Rate" 
                    value={pncVisitCompletion.pnc1_received ? Math.round((pncVisitCompletion.pnc1_received / delivered) * 100) : 0} 
                    unit="%" 
                    color="border-violet-600"
                    icon={Heart}
                />
                 <StatCard 
                    title="Literacy Rate" 
                    value={literacyStatusDistribution.Literate ? Math.round((literacyStatusDistribution.Literate / totalPatients) * 100) : 0} 
                    unit="%" 
                    color="border-gray-600"
                    icon={BookOpen}
                />
            </div>

            {/* Charts/Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Monthly Registrations */}
                <div className="lg:col-span-1 xl:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <MonthlyRegChart data={monthlyRegistrations} title="Monthly ANC Registrations" />
                </div>
                
                {/* Delivery Outcomes */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Delivery Outcome Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={deliveryOutcomeChartData} options={pieDoughnutOptions} />
                    </div>
                </div>

                {/* ANC Visit Completion by Visit Number */}
                <div className="lg:col-span-1 xl:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">ANC Visit Completion by Visit Number</h3>
                    <div className="h-64">
                        <Bar data={ancVisitCompletionChartData} options={chartOptions} />
                    </div>
                </div>

                {/* ANC Services Provided */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">ANC Services Provided</h3>
                    <div className="h-64">
                        <Bar data={ancServicesChartData} options={chartOptions} />
                    </div>
                </div>

                {/* HIV Test Results Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">HIV Test Results Distribution</h3>
                    <div className="h-64">
                        <Doughnut data={hivTestResultsChartData} options={pieDoughnutOptions} />
                    </div>
                </div>

                {/* Family Planning Methods Usage */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Family Planning Methods Utilized</h3>
                    <div className="h-64">
                        <Bar data={fpMethodsUsageChartData} options={chartOptions} />
                    </div>
                </div>
                
                {/* Child Immunization Coverage (All Vaccines) */}
                <div className="lg:col-span-1 xl:col-span-3 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Child Immunization Coverage (All Vaccines)</h3>
                    <div className="h-96">
                        <Bar data={allImmunizationChartData} options={{...chartOptions, scales: { x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } }, y: { beginAtZero: true, max: 100, ticks: { stepSize: 10, callback: (value) => value + '%' } } }}} />
                    </div>
                </div>

                {/* PNC Visit Completion */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">PNC Visit Completion</h3>
                    <div className="h-64">
                        <Bar data={pncCompletionChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Health Insurance Enrollment by Type */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Health Insurance Enrollment by Type</h3>
                    <div className="h-64">
                        <Doughnut data={healthInsuranceTypeChartData} options={pieDoughnutOptions} />
                    </div>
                </div>

                {/* Literacy Status Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Literacy Status Distribution</h3>
                    <div className="h-64">
                        <Doughnut data={literacyStatusChartData} options={pieDoughnutOptions} />
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Age Distribution</h3>
                    <div className="h-64">
                        <Bar data={ageDistributionChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Delivery Type Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Delivery Type Distribution</h3>
                    <div className="h-64">
                        <Doughnut data={deliveryTypeChartData} options={pieDoughnutOptions} />
                    </div>
                </div>

                {/* Delivery Kits Received */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Delivery Kits Received</h3>
                    <div className="h-64">
                        <Pie data={deliveryKitsChartData} options={pieDoughnutOptions} />
                    </div>
                </div>
            </div>

            {/* Detailed Data Tables */}
             <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Detailed Data Tables</h3>
                
                {/* ANC Visit Counts */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-purple-700 mb-3 flex items-center gap-2"><Stethoscope size={20} /> ANC Visit Counts</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600 bg-gray-50 rounded-lg">
                            <thead className="bg-purple-100 text-purple-800 font-medium">
                                <tr>
                                    <th className="px-4 py-2 border-b">Visit</th>
                                    <th className="px-4 py-2 border-b">Patients Completed</th>
                                    <th className="px-4 py-2 border-b">Percentage of Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 8 }, (_, i) => i + 1).map(visit => (
                                    <tr key={visit} className="border-b hover:bg-white">
                                        <td className="px-4 py-2">ANC {visit}</td>
                                        <td className="px-4 py-2">{ancVisitsBreakdown[`anc${visit}`] || 0}</td>
                                        <td className="px-4 py-2">{totalPatients > 0 ? Math.round(((ancVisitsBreakdown[`anc${visit}`] || 0) / totalPatients) * 100) : 0}%</td>
                                    </tr>
                                ))}
                                <tr className="border-b hover:bg-white">
                                    <td className="px-4 py-2 font-semibold">Additional ANC Visits (5+)</td>
                                    <td className="px-4 py-2 font-semibold">{ancVisitsBreakdown.anc5plus || 0}</td>
                                    <td className="px-4 py-2 font-semibold">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ANC Services Summary */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-green-700 mb-3 flex items-center gap-2"><FlaskConical size={20} /> ANC Services Provided Summary</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600 bg-gray-50 rounded-lg">
                            <thead className="bg-green-100 text-green-800 font-medium">
                                <tr>
                                    <th className="px-4 py-2 border-b">Service</th>
                                    <th className="px-4 py-2 border-b">Times Provided</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(ancServiceCounts).map(([service, count]) => (
                                    <tr key={service} className="border-b hover:bg-white">
                                        <td className="px-4 py-2">{service.replace(/([A-Z])/g, ' $1').trim()}</td>
                                        <td className="px-4 py-2">{count || 0}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Individual Vaccine Coverage */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-orange-700 mb-3 flex items-center gap-2"><Baby size={20} /> Individual Child Vaccine Coverage</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600 bg-gray-50 rounded-lg">
                            <thead className="bg-orange-100 text-orange-800 font-medium">
                                <tr>
                                    <th className="px-4 py-2 border-b">Vaccine</th>
                                    <th className="px-4 py-2 border-b">Patients Received</th>
                                    <th className="px-4 py-2 border-b">Coverage Rate (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(immunizationCoverageDetails).map(([vaccineKey, data]) => (
                                    <tr key={vaccineKey} className="border-b hover:bg-white">
                                        <td className="px-4 py-2">{vaccineKey.replace(/_received/g, '').replace(/([A-Z])/g, ' $1').trim()}</td>
                                        <td className="px-4 py-2">{data.count || 0}</td>
                                        <td className="px-4 py-2">{data.rate || 0}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PNC Visit Summary */}
                <div className="mb-8">
                    <h4 className="text-xl font-semibold text-violet-700 mb-3 flex items-center gap-2"><Heart size={20} /> Postnatal Care Visit Summary</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600 bg-gray-50 rounded-lg">
                            <thead className="bg-violet-100 text-violet-800 font-medium">
                                <tr>
                                    <th className="px-4 py-2 border-b">Visit</th>
                                    <th className="px-4 py-2 border-b">Patients Completed</th>
                                    <th className="px-4 py-2 border-b">Percentage of Delivered</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b hover:bg-white">
                                    <td className="px-4 py-2">PNC Visit 1</td>
                                    <td className="px-4 py-2">{pncVisitCompletion.pnc1_received || 0}</td>
                                    <td className="px-4 py-2">{delivered > 0 ? Math.round(((pncVisitCompletion.pnc1_received || 0) / delivered) * 100) : 0}%</td>
                                </tr>
                                <tr className="border-b hover:bg-white">
                                    <td className="px-4 py-2">PNC Visit 2</td>
                                    <td className="px-4 py-2">{pncVisitCompletion.pnc2_received || 0}</td>
                                    <td className="px-4 py-2">{delivered > 0 ? Math.round(((pncVisitCompletion.pnc2_received || 0) / delivered) * 100) : 0}%</td>
                                </tr>
                                <tr className="border-b hover:bg-white">
                                    <td className="px-4 py-2">PNC Visit 3</td>
                                    <td className="px-4 py-2">{pncVisitCompletion.pnc3_received || 0}</td>
                                    <td className="px-4 py-2">{delivered > 0 ? Math.round(((pncVisitCompletion.pnc3_received || 0) / delivered) * 100) : 0}%</td>
                                </tr>
                                <tr className="font-semibold bg-gray-100">
                                    <td className="px-4 py-2">Incomplete PNCs (Delivered)</td>
                                    <td className="px-4 py-2">{pncIncompleteCount}</td>
                                    <td className="px-4 py-2">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

             </div>
        </PhcStaffLayout>
    );
}