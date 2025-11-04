import React from 'react';
import MonthlyAncBar from '../Charts/MonthlyAncBar';

export default function ReportCharts() {
  // Sample data for the chart
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [45, 52, 38, 61, 55, 48, 72, 65, 58, 63, 70, 75]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Monthly ANC Registrations</h3>
        <MonthlyAncBar 
          labels={monthlyData.labels} 
          data={monthlyData.data} 
        />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Patient Statistics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
            <span>Total Registered Patients</span>
            <span className="font-bold">1,847</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span>Completed ANC 4</span>
            <span className="font-bold">1,234 (67%)</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
            <span>Pending Deliveries</span>
            <span className="font-bold">89</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-red-50 rounded">
            <span>Overdue Follow-ups</span>
            <span className="font-bold">23</span>
          </div>
        </div>
      </div>
    </div>
  );
}