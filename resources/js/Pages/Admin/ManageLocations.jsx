import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout"; // <-- CORRECTED IMPORT PATH
import { useForm, usePage } from "@inertiajs/react";
import { PlusCircle, MapPin } from "lucide-react";

export default function ManageLocations() {
  // Get data passed from the controller via Inertia props
  const { lgas: initialLgas = [], wards: initialWards = [] } = usePage().props;

  // Use props for display
  const lgas = initialLgas;
  const wards = initialWards;

  // Form for adding a new LGA
  const lgaForm = useForm({
    name: "",
    code: "", // Added code as per migration
  });

  // Form for adding a new Ward
  const wardForm = useForm({
    name: "",
    code: "",
    lga_id: "", // Will hold the ID of the parent LGA
  });

  const handleLgaSubmit = (e) => {
    e.preventDefault();
    // POST request to the LgaController@store method
    lgaForm.post(route('admin.lgas.store'), {
      onSuccess: () => {
        // Use Inertia's flash to show success across reloads, then reload the page data
        // For simplicity here, we use alert and reset form, but a full Inertia flash is better
        alert(`LGA '${lgaForm.data.name}' added successfully!`);
        lgaForm.reset();
        // Since we don't have a live state update hook, a simple page visit would reload the data
        // In a real application, Inertia.reload() or redirect is implied here.
      },
      onError: (e) => console.error("LGA Store Error:", e)
    });
  };

  const handleWardSubmit = (e) => {
    e.preventDefault();
    
    // POST request to the WardController@store method
    wardForm.post(route('admin.wards.store'), {
      onSuccess: () => {
        // Find the LGA name for the alert
        const parentLga = lgas.find(l => l.id == wardForm.data.lga_id);
        alert(`Ward '${wardForm.data.name}' added successfully under ${parentLga?.name || 'N/A'}!`);
        wardForm.reset();
      },
      onError: (e) => console.error("Ward Store Error:", e)
    });
  };

  // Helper function to get LGA name from ID for the Wards table
  const getLgaName = (lga_id) => lgas.find(l => l.id === lga_id)?.name || 'N/A';

  return (
    <AdminLayout title="Manage Locations">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Location Data Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- LGA Management --- */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <PlusCircle size={20} /> Add New Local Government Area (LGA)
          </h3>
          <form onSubmit={handleLgaSubmit} className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="LGA Name (e.g., Kaura)"
              value={lgaForm.data.name}
              onChange={(e) => lgaForm.setData("name", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
            {lgaForm.errors.name && <p className="text-red-500 text-sm">{lgaForm.errors.name}</p>}
            
            <input
              type="text"
              placeholder="LGA Code (e.g., KUR)"
              value={lgaForm.data.code}
              onChange={(e) => lgaForm.setData("code", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              maxLength={3}
              required
            />
            {lgaForm.errors.code && <p className="text-red-500 text-sm">{lgaForm.errors.code}</p>}

            <button
              type="submit"
              disabled={lgaForm.processing}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {lgaForm.processing ? "Saving..." : "Save LGA"}
            </button>
          </form>
          
          <h4 className="font-semibold text-gray-700 mb-2">Existing LGAs</h4>
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-600">ID</th>
                        <th className="px-4 py-2 text-left text-gray-600">Name</th>
                        <th className="px-4 py-2 text-left text-gray-600">Code</th>
                    </tr>
                </thead>
                <tbody>
                    {lgas.map((lga) => (
                        <tr key={lga.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-2">{lga.id}</td>
                            <td className="px-4 py-2">{lga.name}</td>
                            <td className="px-4 py-2">{lga.code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {lgas.length === 0 && <p className="text-center py-4 text-gray-500">No LGAs registered.</p>}
          </div>
        </div>

        {/* --- Ward Management --- */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <MapPin size={20} /> Add New Ward
          </h3>
          <form onSubmit={handleWardSubmit} className="space-y-4 mb-8">
            <select
              value={wardForm.data.lga_id}
              onChange={(e) => wardForm.setData("lga_id", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            >
              <option value="" disabled>Select Parent LGA *</option>
              {lgas.map((lga) => (
                <option key={lga.id} value={lga.id}>
                  {lga.name}
                </option>
              ))}
            </select>
            {wardForm.errors.lga_id && <p className="text-red-500 text-sm">{wardForm.errors.lga_id}</p>}

            <input
              type="text"
              placeholder="Ward Name (e.g., Goningora Ward)"
              value={wardForm.data.name}
              onChange={(e) => wardForm.setData("name", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              required
            />
            {wardForm.errors.name && <p className="text-red-500 text-sm">{wardForm.errors.name}</p>}

            <input
              type="text"
              placeholder="Ward Code (e.g., GON)"
              value={wardForm.data.code}
              onChange={(e) => wardForm.setData("code", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
              maxLength={3}
              required
            />
            {wardForm.errors.code && <p className="text-red-500 text-sm">{wardForm.errors.code}</p>}


            <button
              type="submit"
              disabled={wardForm.processing || lgas.length === 0}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {wardForm.processing ? "Saving..." : "Save Ward"}
            </button>
            {lgas.length === 0 && <p className="text-red-500 text-sm">You must add an LGA first.</p>}
          </form>
          
          <h4 className="font-semibold text-gray-700 mb-2">Existing Wards</h4>
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-gray-100 border-b">
                    <tr>
                        <th className="px-4 py-2 text-left text-gray-600">ID</th>
                        <th className="px-4 py-2 text-left text-gray-600">Ward Name</th>
                        <th className="px-4 py-2 text-left text-gray-600">Parent LGA</th>
                        <th className="px-4 py-2 text-left text-gray-600">Code</th>
                    </tr>
                </thead>
                <tbody>
                    {wards.map((ward) => (
                        <tr key={ward.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-2">{ward.id}</td>
                            <td className="px-4 py-2">{ward.name}</td>
                            <td className="px-4 py-2">{getLgaName(ward.lga_id)}</td>
                            <td className="px-4 py-2">{ward.code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {wards.length === 0 && <p className="text-center py-4 text-gray-500">No Wards registered.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}