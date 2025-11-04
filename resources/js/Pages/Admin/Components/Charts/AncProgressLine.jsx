import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function AncProgressLine({
  labels = [],
  monthlyValues = [],
  baselineValue = 0,
}) {
  if (!Array.isArray(labels) || !Array.isArray(monthlyValues) || monthlyValues.length === 0) {
    return (
      <p className="text-gray-500 text-center py-6">
        No ANC progress data available.
      </p>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly ANC Progress (%)",
        data: monthlyValues,
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Target (25%)",
        data: new Array(labels.length).fill(baselineValue),
        borderColor: "rgba(239,68,68,0.9)",
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return <Line data={data} options={options} />;
}
