import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout"; 
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Database
} from "lucide-react";

// Fixed Pagination component with null href protection
const Pagination = ({ links }) => {
    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || ""} // Ensure href is never null
                        disabled={!link.url}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                            link.active
                                ? 'bg-purple-600 text-white border-purple-600 z-10'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} first:rounded-l-md last:rounded-r-md`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </div>
    );
};

export default function MyRecords() {
  // Destructure server-side data and filters
  const { 
    patients: paginatedPatients, 
    filters = {},
    auth 
  } = usePage().props;
  
  const patientResults = paginatedPatients?.data || [];
  
  // State for search - using client-side filtering
  const [search, setSearch] = useState("");
  
  // Placeholder functions for CRUD actions
  const handleDelete = (id) => { 
    if (confirm("Are you sure you want to delete this patient record?")) { 
        router.delete(route("phc.patients.destroy", id)); 
    } 
  };
  
  const handleEdit = (patient) => { 
    // ✅ FIXED: Use the correct route name
    router.get(route('phc.patients.edit', patient.id));
  };

  // Client-side filtering logic - ONLY filter if search term exists
  // Otherwise show all records from the current page
  const displayedPatients = search 
    ? patientResults.filter((p) => {
        const searchTerm = search.toLowerCase();
        return (
          p.woman_name?.toLowerCase().includes(searchTerm) ||
          p.unique_id?.toLowerCase().includes(searchTerm) ||
          p.phone_number?.toLowerCase().includes(searchTerm) ||
          (p.lga?.name && p.lga.name.toLowerCase().includes(searchTerm)) ||
          (p.ward?.name && p.ward.name.toLowerCase().includes(searchTerm)) ||
          (p.community && p.community.toLowerCase().includes(searchTerm))
        );
      })
    : patientResults; // Show all records from current page when no search

  return (
    <PhcStaffLayout title="My Patient Records">
        {/* Header - Records Count and New Patient Button */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">
            All Patient Records ({paginatedPatients?.total || 0})
          </h1>
          <Link
            href={route('phc.create-patient')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center mt-2 md:mt-0"
          >
            + Register New Patient
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-xl shadow-md">
          <Search size={20} className="text-purple-600" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, LGA, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
          />
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3">Unique ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">LGA/Ward</th>
                <th className="px-4 py-3">EDD</th>
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPatients.length > 0 ? (
                displayedPatients.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.unique_id}</td>
                    <td className="px-4 py-3">{p.woman_name}</td>
                    <td className="px-4 py-3">{p.lga?.name || 'N/A'}/{p.ward?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{p.edd ? new Date(p.edd).toLocaleDateString() : "N/A"}</td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            p.alert === 'Up to date' ? 'bg-green-100 text-green-800' :
                            (p.alert && (p.alert.includes('Overdue') || p.alert.includes('PNC'))) ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {p.alert || 'N/A'}
                        </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link 
                          href={route('phc.patients.show', p.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                      >
                          <Eye size={16} />
                      </Link>
                      <button
                          onClick={() => handleEdit(p)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit Record"
                      >
                          <Edit size={16} />
                      </button>
                      <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Record"
                      >
                          <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-gray-400 py-6 font-medium"
                  >
                    {search ? "No patient records match your criteria." : "No patient records found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Links - Show pagination when not searching */}
        {!search && paginatedPatients?.links && <Pagination links={paginatedPatients.links} />}

    </PhcStaffLayout>
  );
}