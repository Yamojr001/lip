import React, { useState, useEffect } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, usePage } from "@inertiajs/react";
import { PlusCircle, Trash2, Hospital } from "lucide-react";

export default function ManageFacilities() {
  // Get props from the controller (lgas, allWards, phcs)
  const { lgas = [], allWards = [], phcs = [] } = usePage().props;

  const { data, setData, post, processing, errors, reset } = useForm({
    // Facility Info
    clinic_name: "",
    lga_id: "",
    ward_id: "",
    address: "",
    email: "",
    contact_phone: "",
    incharge_name: "",
    
    // ANC Working Days (Array of objects)
    anc_working_days: [{ day: "Monday", time_from: "09:00", time_to: "17:00" }], // Default value
    
    // File Upload 
    images: null, 
    
    // Auth Info for new User (In-Charge)
    user_name: "",
    password: "",
  });

  // Cascading Dropdowns Logic (Optimized for stability)
  const [wardsInLGA, setWardsInLGA] = useState([]);
  const [facilitiesInWard, setFacilitiesInWard] = useState([]);

  // Filter Wards by LGA (LGA -> Ward)
  useEffect(() => {
    const selectedLgaId = data.lga_id ? parseInt(data.lga_id) : null;
    
    if (selectedLgaId) {
        const filteredWards = allWards.filter(w => w.lga_id === selectedLgaId);
        setWardsInLGA(filteredWards);
    } else {
        setWardsInLGA([]);
    }
  }, [data.lga_id, allWards]);

  // Filter Facilities by Ward (Ward -> Facility)
  useEffect(() => {
    const selectedWardId = data.ward_id ? parseInt(data.ward_id) : null;
    
    if (selectedWardId) {
        const wardFacilities = phcs.filter(f => f.ward_id === selectedWardId);
        setFacilitiesInWard(wardFacilities);
    } else {
        setFacilitiesInWard([]);
    }
  }, [data.ward_id, phcs]);

  // Handler for LGA to clear dependents immediately
  const handleLGAChange = (e) => {
    const lgaId = e.target.value;
    setData('lga_id', lgaId);
    setData('ward_id', '');
  };
  
  // Handler for Ward to clear dependents immediately
  const handleWardChange = (e) => {
    const wardId = e.target.value;
    setData('ward_id', wardId);
  };
  
  // Handle ANC Working Days array
  const handleAddDay = () => {
    setData('anc_working_days', [
      ...data.anc_working_days,
      { day: "Monday", time_from: "09:00", time_to: "17:00" },
    ]);
  };

  const handleRemoveDay = (index) => {
    const newDays = data.anc_working_days.filter((_, i) => i !== index);
    setData('anc_working_days', newDays);
  };

  const handleDayChange = (index, key, value) => {
    const newDays = data.anc_working_days.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setData('anc_working_days', newDays);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.phcs.store'), {
      onSuccess: () => {
        alert(`PHC '${data.clinic_name}' added and In-Charge user created successfully!`);
        reset();
      },
      onError: (e) => console.error("PHC Store Error:", e)
    });
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <AdminLayout title="Manage Facilities">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Primary Health Care (PHC) Facility Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- Add New PHC Form --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <PlusCircle size={20} /> Register New PHC
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Facility Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                <h4 className="md:col-span-2 text-md font-semibold text-gray-700">Facility Information</h4>
                
                <input
                    type="text"
                    placeholder="Clinic Name *"
                    value={data.clinic_name}
                    onChange={(e) => setData("clinic_name", e.target.value)}
                    className="p-2 border rounded-lg md:col-span-2"
                    required
                />
                {errors.clinic_name && <p className="text-red-500 text-sm md:col-span-2">{errors.clinic_name}</p>}

                {/* LGA Dropdown */}
                <select
                    value={data.lga_id}
                    onChange={handleLGAChange}
                    className="p-2 border rounded-lg"
                    required
                >
                    <option value="">Select LGA *</option>
                    {lgas.map((lga) => (
                        <option key={lga.id} value={lga.id}>
                            {lga.name}
                        </option>
                    ))}
                </select>
                {errors.lga_id && <p className="text-red-500 text-sm">{errors.lga_id}</p>}

                {/* Ward Dropdown (Cascading) */}
                <select
                    value={data.ward_id}
                    onChange={handleWardChange}
                    className="p-2 border rounded-lg"
                    required
                    disabled={!data.lga_id}
                >
                    <option value="">Select Ward *</option>
                    {wardsInLGA.map((ward) => (
                        <option key={ward.id} value={ward.id}>
                            {ward.name}
                        </option>
                    ))}
                </select>
                {errors.ward_id && <p className="text-red-500 text-sm">{errors.ward_id}</p>}

                <input
                    type="text"
                    placeholder="Facility Address *"
                    value={data.address}
                    onChange={(e) => setData("address", e.target.value)}
                    className="p-2 border rounded-lg md:col-span-2"
                    required
                />
                {errors.address && <p className="text-red-500 text-sm md:col-span-2">{errors.address}</p>}
                
                <input
                    type="email"
                    placeholder="Facility Email"
                    value={data.email}
                    onChange={(e) => setData("email", e.target.value)}
                    className="p-2 border rounded-lg"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                
                <input
                    type="text"
                    placeholder="Contact Phone *"
                    value={data.contact_phone}
                    onChange={(e) => setData("contact_phone", e.target.value)}
                    className="p-2 border rounded-lg"
                    required
                />
                {errors.contact_phone && <p className="text-red-500 text-sm">{errors.contact_phone}</p>}
                
                <input
                    type="text"
                    placeholder="In-Charge Name *"
                    value={data.incharge_name}
                    onChange={(e) => setData("incharge_name", e.target.value)}
                    className="p-2 border rounded-lg md:col-span-2"
                    required
                />
                {errors.incharge_name && <p className="text-red-500 text-sm md:col-span-2">{errors.incharge_name}</p>}

                {/* File input for images */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Images (1 or more)</label>
                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => setData('images', e.target.files)}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                    {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
                </div>
            </div>

            {/* ANC Working Days */}
            <div className="border-b pb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-3">ANC Working Days & Times</h4>
                {data.anc_working_days.map((day, index) => (
                    <div key={index} className="grid grid-cols-10 gap-2 mb-2 items-center">
                        {/* Day Dropdown */}
                        <select
                            value={day.day}
                            onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                            className="p-2 border rounded-lg col-span-4"
                            required
                        >
                            <option value="">Select Day *</option>
                            {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        
                        {/* Time From */}
                        <input
                            type="time"
                            value={day.time_from}
                            onChange={(e) => handleDayChange(index, 'time_from', e.target.value)}
                            className="p-2 border rounded-lg col-span-3"
                            required
                        />
                        
                        {/* Time To */}
                        <input
                            type="time"
                            value={day.time_to}
                            onChange={(e) => handleDayChange(index, 'time_to', e.target.value)}
                            className="p-2 border rounded-lg col-span-2"
                            required
                        />

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={() => handleRemoveDay(index)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={data.anc_working_days.length === 1}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={handleAddDay}
                    className="mt-2 text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1"
                >
                    <PlusCircle size={16} /> Add Another Day
                </button>
                {errors.anc_working_days && <p className="text-red-500 text-sm">{errors.anc_working_days}</p>}
            </div>

            {/* In-Charge User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="md:col-span-2 text-md font-semibold text-gray-700">In-Charge User Account</h4>
                <input
                    type="text"
                    placeholder="In-Charge Username *"
                    value={data.user_name}
                    onChange={(e) => setData("user_name", e.target.value)}
                    className="p-2 border rounded-lg"
                    required
                />
                {errors.user_name && <p className="text-red-500 text-sm">{errors.user_name}</p>}
                
                <input
                    type="password"
                    placeholder="In-Charge Password *"
                    value={data.password}
                    onChange={(e) => setData("password", e.target.value)}
                    className="p-2 border rounded-lg"
                    required
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {processing ? "Registering Facility..." : "Register Facility"}
            </button>
          </form>
        </div>

        {/* --- Existing PHCs Table --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Existing PHCs ({phcs.length})</h3>
            <div className="max-h-[80vh] overflow-y-auto border rounded-lg">
                <table className="min-w-full text-sm">
                    <thead className="sticky top-0 bg-gray-100 border-b">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-600">Facility</th>
                            <th className="px-4 py-2 text-left text-gray-600">LGA/Ward</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phcs.map((phc) => (
                            <tr key={phc.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">{phc.clinic_name}</td>
                                <td className="px-4 py-2 text-xs">
                                    {phc.lga?.name || 'N/A'} / {phc.ward?.name || 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {phcs.length === 0 && <p className="text-center py-4 text-gray-500">No PHCs registered.</p>}
            </div>
        </div>
      </div>
    </AdminLayout>
  );
}