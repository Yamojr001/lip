import React, { useState } from "react";
import { useForm, usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout"; 
import {
  Search,
  Edit,
  Trash2,
} from "lucide-react";

export default function PhcDashboard() {
  // Destructure props (using default empty arrays/objects for safety)
  const { 
    patients = { data: [] }, 
    auth, 
    lgas = [], 
    wards = [] 
  } = usePage().props;
  
  const results = patients?.data || [];
  
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize useForm with all expected fields
  const { data, setData, post, put, processing, reset, errors } = useForm({
    woman_name: "", age: "", literacy_status: "Not sure", phone_number: "", 
    husband_name: "", husband_phone: "", community: "", address: "", 
    lga_id: "", ward_id: "", health_facility_id: "", gravida: "", parity: "", 
    date_of_registration: "", edd: "", anc_visit_1: "", anc_visit_2: "", anc_visit_3: "", 
    anc_visit_4: "", additional_anc_count: "", tracked_before_anc1: false, tracked_before_anc2: false, 
    tracked_before_anc3: false, tracked_before_anc4: false, place_of_delivery: "", 
    delivery_kits_received: false, type_of_delivery: "", delivery_outcome: "", 
    date_of_delivery: "", pnc_visit_1: "", pnc_visit_2: "", remark: "", comments: "",
  });

  // Placeholder functions for CRUD actions
  const handleSubmit = (e) => { e.preventDefault(); console.log("Submit via Dashboard Modal"); };
  const handleEditSubmit = (e) => { e.preventDefault(); console.log("Edit via Dashboard Modal"); };
  const handleDelete = (id) => { if (confirm("Are you sure?")) { router.delete(route("phc.patients.destroy", id)); } };
  const handleEdit = (patient) => { 
    setEditingPatient(patient);
    // Populate form data for edit
    Object.keys(data).forEach(key => { if (patient[key] !== undefined) { setData(key, patient[key] || ""); } });
    setShowEditModal(true);
  };
  const resetForm = () => { reset(); setEditingPatient(null); setShowModal(false); setShowEditModal(false); };
  
  // Search functionality
  const filtered = results.filter((p) => {
    const searchTerm = search.toLowerCase();
    return (
      p.woman_name?.toLowerCase().includes(searchTerm) ||
      p.unique_id?.toLowerCase().includes(searchTerm) ||
      p.phone_number?.toLowerCase().includes(searchTerm)
    );
  });


  return (
    <PhcStaffLayout>
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">
            Welcome, {auth?.user?.name || "Staff"}
          </h1>
          <p className="text-gray-600">Manage patients and reports</p>
        </div>

        {/* Dashboard Cards (MOCK LOGIC) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow p-4 rounded-lg border-l-4 border-purple-500">
            <h3 className="text-sm text-gray-500">Total Patients</h3>
            <p className="text-2xl font-semibold">{results.length}</p>
          </div>
          <div className="bg-white shadow p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="text-sm text-gray-500">This Month's Registrations</h3>
            <p className="text-2xl font-semibold">12</p> {/* Mock value */}
          </div>
          <div className="bg-white shadow p-4 rounded-lg border-l-4 border-yellow-500">
            <h3 className="text-sm text-gray-500">Upcoming Deliveries</h3>
            <p className="text-2xl font-semibold">15</p> {/* Mock value */}
          </div>
          <div className="bg-white shadow p-4 rounded-lg border-l-4 border-red-500">
            <h3 className="text-sm text-gray-500">Overdue Follow-ups</h3>
            <p className="text-2xl font-semibold">5</p> {/* Mock value */}
          </div>
        </div>

        {/* Search and Table */}
        <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 w-full md:w-1/3">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>
          <Link
            href={route('phc.create-patient')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
          >
            + Add New Patient
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3">Unique ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">LGA/Ward</th>
                <th className="px-4 py-3">EDD</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.unique_id}</td>
                    <td className="px-4 py-3">{p.woman_name}</td>
                    {/* Display names from the eager-loaded relationships */}
                    <td className="px-4 py-3">{p.lga?.name || 'N/A'}/{p.ward?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{p.edd || "N/A"}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center text-gray-400 py-3 font-medium"
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      {/* Note: Modal Logic is assumed to be outside of this block */}
    </PhcStaffLayout>
  );
}