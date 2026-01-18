import React, { useState } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { Link, usePage } from "@inertiajs/react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Eye, 
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";

export default function VaccineReports({ reports, filters }) {
  const { auth } = usePage().props;
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');
  const [statusFilter, setStatusFilter] = useState(filters?.status || '');

  // Helper function to safely parse and get wastage rate
  const getWastageRate = (rate) => {
    const parsedRate = parseFloat(rate);
    return isNaN(parsedRate) ? 0 : parsedRate;
  };

  // Calculate statistics
  const stats = {
    total: reports.total,
    submitted: reports.data.filter(r => r.status === 'submitted').length,
    approved: reports.data.filter(r => r.status === 'approved').length,
    draft: reports.data.filter(r => r.status === 'draft').length,
    averageWastage: reports.data.length > 0 
      ? (reports.data.reduce((sum, r) => sum + getWastageRate(r.vaccine_wastage_rate), 0) / reports.data.length).toFixed(2)
      : 0,
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  return (
    <PhcStaffLayout title="Vaccine Reports">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Vaccine Accountability Reports</h1>
          <p className="text-gray-600 mt-2">View and manage all vaccine utilization reports for {auth?.user?.phc?.clinic_name}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Wastage</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageWastage}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports by month..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <Link
                href={route('phc.vaccine-accountability')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>New Report</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Month/Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doses Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Wastage Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stock Outs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Submitted On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.data.map((report) => {
                  const wastageRate = getWastageRate(report.vaccine_wastage_rate);
                  const isHighWastage = wastageRate > 10;
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{report.month_year || 'N/A'}</div>
                            <div className="text-sm text-gray-500">Report #{report.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">{report.total_doses_used || 0}</div>
                        <div className="text-sm text-gray-500">doses</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden mr-3">
                            <div 
                              className={`h-full ${isHighWastage ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ 
                                width: `${Math.min(wastageRate, 100)}%` 
                              }}
                            ></div>
                          </div>
                          <span className={`font-medium ${isHighWastage ? 'text-red-600' : 'text-green-600'}`}>
                            {wastageRate.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {report.stock_out_count > 0 ? (
                            <>
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              <span className="font-medium text-red-600">{report.stock_out_count || 0}</span>
                            </>
                          ) : (
                            <span className="text-green-600 font-medium">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={route('phc.vaccine-reports.show', report.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                          {report.status === 'draft' && (
                            <Link
                              href={route('phc.vaccine-accountability')}
                              className="text-yellow-600 hover:text-yellow-900 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {reports.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{reports.from}</span> to{' '}
                  <span className="font-medium">{reports.to}</span> of{' '}
                  <span className="font-medium">{reports.total}</span> results
                </div>
                <div className="flex space-x-2">
                  {reports.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      preserveScroll
                      className={`px-3 py-1 rounded-md ${
                        link.active
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {reports.data.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first vaccine accountability report.</p>
            <Link
              href={route('phc.vaccine-accountability')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
            >
              <FileText className="h-5 w-5" />
              <span>Create First Report</span>
            </Link>
          </div>
        )}
      </div>
    </PhcStaffLayout>
  );
}