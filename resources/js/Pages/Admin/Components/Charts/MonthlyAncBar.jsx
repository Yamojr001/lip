import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function MonthlyAncBar({ labels, data }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "ANC Registrations",
        data,
        backgroundColor: "#4f46e5",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 10 } },
    },
  };

  return <Bar data={chartData} options={options} />;
}

