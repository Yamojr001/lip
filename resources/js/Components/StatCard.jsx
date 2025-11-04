// resources/js/Components/StatCard.jsx
import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 text-center">
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-bold text-purple-800 mt-2">{value}</p>
    </div>
  );
}
