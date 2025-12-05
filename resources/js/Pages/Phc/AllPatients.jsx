import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
  Search,
  Eye,
  Edit,
  Building,
  User,
  MapPin
} from "lucide-react";

const Pagination = ({ links }) => {
    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || ""}
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

export default function AllPatients() {
  const { 
    patients: paginatedPatients, 
    filters = {},
    auth 
  } = usePage().props;
  
  const patientResults = paginatedPatients?.data || [];
  
  // State for search
  const [search, setSearch] = useState(filters.search || "");
  
  // Handle search with debounce
  const handleSearch = (value) => {
    setSearch(value);
    
    if (value.trim()) {
      router.get(route('phc.all-patients'), { search: value }, {
        preserveState: true,
        replace: true,
      });
    } else {
      // If search is empty, clear results
      router.get(route('phc.all-patients'), {}, {
        preserveState: true,
        replace: true,
      });
    }
  };

  // Handle view patient
  const handleView = (patient) => {
    router.get(route('phc.all-patients.show', patient.id));
  };

  // Handle edit patient
  const handleEdit = (patient) => {
    router.get(route('phc.all-patients.edit', patient.id));
  };

  return (
    <PhcStaffLayout title="Search All Patients">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-700">
              Search All Patients
            </h1>
            <p className="text-gray-600 mt-1">
              Search across all facilities in the system. Patients will only appear when you search.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-purple-600" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, LGA, ward, or facility..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          
          {/* Search Tips */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Search tips:</strong> You can search by patient name, unique ID, phone number, LGA, ward, or health facility name.
            </p>
          </div>
        </div>

        {/* Results Section */}
        {search && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-purple-600 text-white px-6 py-3">
              <h2 className="text-lg font-semibold">
                Search Results ({paginatedPatients?.total || 0})
              </h2>
            </div>
            
            {/* Records Table with horizontal scrolling on mobile */}
            {patientResults.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-600 whitespace-nowrap">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">Unique ID</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Patient Info</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Location</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Facility</th>
                        <th className="px-4 py-3 font-medium text-gray-700">EDD</th>
                        <th className="px-4 py-3 font-medium text-gray-700 sticky right-0 bg-gray-50 z-10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientResults.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono font-medium text-purple-600 sticky left-0 bg-white z-10 border-r">
                            {p.unique_id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[200px]">
                              <User size={14} className="text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">{p.woman_name}</div>
                                <div className="text-xs text-gray-500">
                                  Age: {p.age} • Phone: {p.phone_number || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[150px]">
                              <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm truncate">{p.lga?.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500 truncate">{p.ward?.name || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[150px]">
                              <Building size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="text-sm truncate">{p.health_facility?.clinic_name || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {p.edd ? new Date(p.edd).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="px-4 py-3 sticky right-0 bg-white z-10 border-l">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleView(p)}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition text-sm flex-shrink-0"
                                title="View Details"
                              >
                                <Eye size={14} />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(p)}
                                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition text-sm flex-shrink-0"
                                title="Edit Patient"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {paginatedPatients?.links && <Pagination links={paginatedPatients.links} />}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Search size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-1">No patients found</h3>
                <p className="text-gray-500">
                  No patients match your search criteria "<strong>{search}</strong>"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State - No Search */}
        {!search && (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-600 mb-2">Search All Patients</h2>
              <p className="text-gray-500 mb-6">
                Enter a search term above to find patients across all facilities in the system. 
                You can search by name, ID, phone number, location, or facility name.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">What you can search for:</h3>
                <ul className="text-sm text-purple-700 text-left space-y-1">
                  <li>• Patient names (e.g., "Aisha", "Maryam")</li>
                  <li>• Unique IDs (e.g., "KAD/CHK/001")</li>
                  <li>• Phone numbers</li>
                  <li>• LGAs (e.g., "Chikun", "Kaduna North")</li>
                  <li>• Wards</li>
                  <li>• Facility names</li>
                </ul>
              </div>
              <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Cross-Facility Editing:</h3>
                <p className="text-sm text-blue-700 text-left">
                  You can view and edit any patient record in the system. When editing patients from other facilities, 
                  their original registration facility will be preserved while allowing you to update their current information.
                </p>
              </div>
            </div>
          </div>
        )}
    </PhcStaffLayout>
  );
}