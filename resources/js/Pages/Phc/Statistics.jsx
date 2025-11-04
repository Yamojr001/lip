// File: resources/js/Pages/Phc/Statistics.jsx

import React from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { usePage } from "@inertiajs/react";
import { Line, Pie, Bar } from "react-chartjs-2"; // Assuming you have these Chart components available
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ArcElement, 
    BarElement, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Register Chart.js components (Needed if not registered globally)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);


// Simple component for a statistic card
const StatCard = ({ title, value, unit, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${color}`}>
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
    </div>
);

// Component for a chart placeholder (to visualize monthly registrations)
const MonthlyRegChart = ({ data }) => {
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

    const options = { responsive: true, plugins: { legend: { position: 'top' } } };

    return (
        <div className="h-64">
            <Line data={chartData} options={options} />
        </div>
    );
};


export default function PhcStatistics() {
    const { phcStats } = usePage().props;
    const { 
        totalPatients, 
        delivered, 
        anc4Completed, 
        liveBirths, 
        deliveryRate, 
        anc4Rate,
        monthlyRegistrations,
        deliveryOutcomes 
    } = phcStats;

    // Data for Delivery Outcome Pie Chart
    const pieData = {
        labels: ['Live birth', 'Stillbirth', 'Other/Miscarriage'],
        datasets: [
            {
                data: [
                    deliveryOutcomes['Live birth'] || 0,
                    deliveryOutcomes['Stillbirth'] || 0,
                    (delivered - (deliveryOutcomes['Live birth'] || 0) - (deliveryOutcomes['Stillbirth'] || 0)) // Calculate 'Other'
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                hoverBackgroundColor: ['#059669', '#dc2626', '#d97706'],
            },
        ],
    };
    
    // Ensure all stats are defined before rendering
    if (!phcStats || totalPatients === undefined) {
        return <PhcStaffLayout title="Clinic Statistics"><p className="p-8">Loading or no data available for this clinic.</p></PhcStaffLayout>;
    }


    return (
        <PhcStaffLayout title="Clinic Statistics">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Performance Overview for Your PHC</h2>
            
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Registered Patients" 
                    value={totalPatients} 
                    unit="" 
                    color="border-purple-600 bg-purple-50"
                />
                <StatCard 
                    title="ANC4 Completion Rate" 
                    value={anc4Rate} 
                    unit="%" 
                    color="border-green-600 bg-green-50"
                />
                <StatCard 
                    title="Health Facility Delivery Rate" 
                    value={deliveryRate} 
                    unit="%" 
                    color="border-blue-600 bg-blue-50"
                />
                <StatCard 
                    title="Live Births Recorded" 
                    value={liveBirths} 
                    unit="" 
                    color="border-yellow-600 bg-yellow-50"
                />
            </div>

            {/* Charts/Visualization Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Monthly Registrations */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-semibold mb-4">Monthly ANC Registrations</h3>
                    <MonthlyRegChart data={monthlyRegistrations} />
                </div>
                
                {/* Delivery Outcomes */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-semibold mb-4">Delivery Outcome Distribution</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>

            {/* Detailed Counts */}
             <div className="mt-8 bg-white p-6 rounded-xl shadow">
                <h3 className="text-xl font-semibold mb-4">Detailed Counts</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <p><strong>Completed ANC4:</strong> {anc4Completed}</p>
                    <p><strong>Total Delivered:</strong> {delivered}</p>
                    <p><strong>PNC Incomplete:</strong> {totalPatients - delivered}</p> {/* Placeholder logic */}
                    <p><strong>Stillbirths:</strong> {deliveryOutcomes['Stillbirth'] || 0}</p>
                </div>
             </div>
        </PhcStaffLayout>
    );
}