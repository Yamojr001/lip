import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function LgaPerformanceBar({ labels = [], data = [] }) {
  // Data-safe fallback
  if (!Array.isArray(labels) || !Array.isArray(data) || data.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">
        No LGA performance data available.
      </p>
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: "ANC4 Completion Rate (%)",
        data,
        backgroundColor: data.map((value) =>
          value >= 70 ? "rgba(34,197,94,0.8)" : "rgba(239,68,68,0.8)"
        ),
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index" },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return <Bar data={chartData} options={options} />;
}
