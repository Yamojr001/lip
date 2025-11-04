// resources/js/Components/ChartSummary.jsx
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

export default function ChartSummary({ data }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data?.labels || [],
        datasets: [
          {
            label: "ANC Visits",
            data: data?.values || [],
            fill: true,
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            borderColor: "#7c3aed",
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }, [data]);

  return <canvas ref={chartRef} height="100" />;
}
