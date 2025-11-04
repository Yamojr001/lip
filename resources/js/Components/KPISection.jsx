import React from "react";

export default function KPISection({ kpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-xl shadow p-4 flex flex-col">
          <h4 className="text-gray-500 text-sm">{kpi.title}</h4>
          <span className="text-2xl font-bold text-gray-800 mt-1">{kpi.value}</span>
          <span className="text-green-600 text-sm mt-1">{kpi.change}</span>
        </div>
      ))}
    </div>
  );
}
