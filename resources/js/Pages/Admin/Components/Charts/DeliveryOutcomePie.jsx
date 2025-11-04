import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DeliveryOutcomePie({ labels, counts }) {
  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: ["#16a34a", "#ef4444", "#facc15", "#3b82f6"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return <Pie data={chartData} options={options} />;
}
