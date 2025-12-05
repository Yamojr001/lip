import React, { useState } from "react";
import { usePage, router, useForm } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { 
    Save, 
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Users,
    Baby,
    Activity,
    Pill,
    Heart,
    ClipboardCheck
} from "lucide-react";

export default function NutritionForm({ report = null }) {
    const { years, months, currentYear, currentMonth } = usePage().props;
    
    const isEdit = !!report;
    
    const { data, setData, post, put, processing, errors } = useForm({
        // Month/Year Selection
        year: report?.year || currentYear || new Date().getFullYear(),
        month: report?.month || currentMonth || '',
        
        // Section 1: Total Children Screened
        total_children_screened: report?.total_children_screened || 0,
        
        // Age 6-23 months (by gender)
        age_6_23_male_screened: report?.age_6_23_male_screened || 0,
        age_6_23_female_screened: report?.age_6_23_female_screened || 0,
        
        // Age 24-59 months (by gender)
        age_24_59_male_screened: report?.age_24_59_male_screened || 0,
        age_24_59_female_screened: report?.age_24_59_female_screened || 0,
        
        // Section 2: Normal Children Identified
        age_6_23_male_normal: report?.age_6_23_male_normal || 0,
        age_6_23_female_normal: report?.age_6_23_female_normal || 0,
        age_24_59_male_normal: report?.age_24_59_male_normal || 0,
        age_24_59_female_normal: report?.age_24_59_female_normal || 0,
        
        // Section 3: MAM Children Identified
        age_6_23_male_mam: report?.age_6_23_male_mam || 0,
        age_6_23_female_mam: report?.age_6_23_female_mam || 0,
        age_24_59_male_mam: report?.age_24_59_male_mam || 0,
        age_24_59_female_mam: report?.age_24_59_female_mam || 0,
        
        // Section 4: SAM Children Identified
        age_6_23_male_sam: report?.age_6_23_male_sam || 0,
        age_6_23_female_sam: report?.age_6_23_female_sam || 0,
        age_24_59_male_sam: report?.age_24_59_male_sam || 0,
        age_24_59_female_sam: report?.age_24_59_female_sam || 0,
        
        // Section 5: SAM Management
        new_sam_this_outreach: report?.new_sam_this_outreach || 0,
        sam_referred_otp: report?.sam_referred_otp || 0,
        
        // Section 6: Oedema Cases
        oedema_sam_complications_male: report?.oedema_sam_complications_male || 0,
        oedema_sam_complications_female: report?.oedema_sam_complications_female || 0,
        oedema_total_male: report?.oedema_total_male || 0,
        oedema_total_female: report?.oedema_total_female || 0,
        
        // Section 7: SAM with Complications to SC
        sam_complications_male_sc: report?.sam_complications_male_sc || 0,
        sam_complications_female_sc: report?.sam_complications_female_sc || 0,
        
        // Section 8: Albendazole
        albendazole_12_23_male: report?.albendazole_12_23_male || 0,
        albendazole_12_23_female: report?.albendazole_12_23_female || 0,
        albendazole_24_59_male: report?.albendazole_24_59_male || 0,
        albendazole_24_59_female: report?.albendazole_24_59_female || 0,
        
        // Section 9: Vitamin A Supplementation (VAS)
        vas_6_11_first_dose_male: report?.vas_6_11_first_dose_male || 0,
        vas_6_11_first_dose_female: report?.vas_6_11_first_dose_female || 0,
        vas_12_59_second_dose_male: report?.vas_12_59_second_dose_male || 0,
        vas_12_59_second_dose_female: report?.vas_12_59_second_dose_female || 0,
        
        // Section 10: Nutrition Products
        rutf_given: report?.rutf_given || 0,
        mnp_given: report?.mnp_given || 0,
        
        // Section 11: Breastfeeding & Counseling
        exclusive_breastfeeding_0_6: report?.exclusive_breastfeeding_0_6 || 0,
        miycf_counselled_pregnant_women: report?.miycf_counselled_pregnant_women || 0,
        miycf_counselled_caregivers: report?.miycf_counselled_caregivers || 0,
        
        // Comments
        comments: report?.comments || '',
        
        // Submission
        submitted: report?.submitted || false,
    });
    
    const handleChange = (field, value) => {
        setData(field, value);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEdit) {
            put(route('phc.nutrition.reports.update', report.id), {
                onSuccess: () => {
                    // Success handling
                },
                onError: (errors) => {
                    // Error handling
                }
            });
        } else {
            post(route('phc.nutrition.reports.store'), {
                onSuccess: () => {
                    // Success handling
                },
                onError: (errors) => {
                    // Error handling
                }
            });
        }
    };
    
    const handleSaveDraft = () => {
        handleSubmit(new Event('submit'));
    };
    
    const handleSaveAndSubmit = () => {
        setData('submitted', true);
        handleSubmit(new Event('submit'));
    };
    
    // Reusable Input Component
    const NumberInput = ({ label, value, onChange, required = true }) => (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                min="0"
                required={required}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            {errors[label] && <p className="text-red-500 text-xs">{errors[label]}</p>}
        </div>
    );
    
    // Age-Gender Section Component
    const AgeGenderSection = ({ title, prefix, showTotal = true }) => {
        const maleField = `${prefix}_male`;
        const femaleField = `${prefix}_female`;
        const total = data[maleField] + data[femaleField];
        
        return (
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumberInput
                        label="Male"
                        value={data[maleField]}
                        onChange={(value) => handleChange(maleField, value)}
                    />
                    <NumberInput
                        label="Female"
                        value={data[femaleField]}
                        onChange={(value) => handleChange(femaleField, value)}
                    />
                    {showTotal && (
                        <div className="bg-white p-3 rounded border">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="text-lg font-bold text-green-600">{total}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    return (
        <PhcStaffLayout title={isEdit ? "Edit Nutrition Report" : "Create Nutrition Report"}>
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isEdit ? `Edit Nutrition Report - ${report.month} ${report.year}` : "Create Monthly Nutrition Report"}
                        </h1>
                        <p className="text-gray-600">
                            {isEdit ? "Update nutrition screening data for this month" : "Enter nutrition screening data for the selected month"}
                        </p>
                    </div>
                    <Link
                        href={route('phc.nutrition.reports.index')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowLeft size={18} />
                        Back to Reports
                    </Link>
                </div>
                
                {/* Month/Year Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                            <select
                                value={data.year}
                                onChange={(e) => handleChange('year', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                required
                            >
                                <option value="">Select Year</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                            <select
                                value={data.month}
                                onChange={(e) => handleChange('month', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                required
                            >
                                <option value="">Select Month</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                            {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
                        </div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Section 1: Total Children Screened */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">1. Total Children Screened</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <NumberInput
                                label="Total Children Screened"
                                value={data.total_children_screened}
                                onChange={(value) => handleChange('total_children_screened', value)}
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                    <AgeGenderSection
                                        title=""
                                        prefix="age_6_23_screened"
                                        showTotal={false}
                                    />
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                    <AgeGenderSection
                                        title=""
                                        prefix="age_24_59_screened"
                                        showTotal={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 2: Normal Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">2. Normal Children Identified</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_6_23_normal"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_24_59_normal"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 3: MAM Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <h3 className="text-lg font-semibold text-gray-800">3. MAM Children Identified</h3>
                            <span className="text-sm text-gray-500">(Moderate Acute Malnutrition)</span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_6_23_mam"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_24_59_mam"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 4: SAM Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-800">4. SAM Children Identified</h3>
                            <span className="text-sm text-gray-500">(Severe Acute Malnutrition)</span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_6_23_sam"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_24_59_sam"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 5: SAM Management */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="h-5 w-5 text-purple-600" />
                            <h3 className="text-lg font-semibold text-gray-800">5. SAM Management</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <NumberInput
                                label="New SAM in this outreach (no filter)"
                                value={data.new_sam_this_outreach}
                                onChange={(value) => handleChange('new_sam_this_outreach', value)}
                            />
                            
                            <NumberInput
                                label="Number of SAM referred to OTP"
                                value={data.sam_referred_otp}
                                onChange={(value) => handleChange('sam_referred_otp', value)}
                            />
                        </div>
                    </div>
                    
                    {/* Section 6: Oedema Cases */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Baby className="h-5 w-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-800">6. Oedema Cases</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Oedema/SAM with complications referred to SC</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="oedema_sam_complications"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Oedema Total (by gender)</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="oedema_total"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 7: SAM with Complications to SC */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <ClipboardCheck className="h-5 w-5 text-red-600" />
                            <h3 className="text-lg font-semibold text-gray-800">7. SAM with Complications referred to Stabilization Center</h3>
                        </div>
                        
                        <AgeGenderSection
                            title="Filtered by gender"
                            prefix="sam_complications_sc"
                        />
                    </div>
                    
                    {/* Section 8: Albendazole */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Pill className="h-5 w-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-800">8. Albendazole Administration</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 12-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="albendazole_12_23"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="albendazole_24_59"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 9: Vitamin A Supplementation (VAS) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="h-5 w-5 text-pink-600" />
                            <h3 className="text-lg font-semibold text-gray-800">9. Vitamin A Supplementation (VAS)</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-11 Months (1st Dose)</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="vas_6_11_first_dose"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 12-59 Months (2nd Dose)</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="vas_12_59_second_dose"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 10: Nutrition Products */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-800">10. Nutrition Products Distribution</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <NumberInput
                                label="Number of children given RUTF (no filter)"
                                value={data.rutf_given}
                                onChange={(value) => handleChange('rutf_given', value)}
                            />
                            
                            <NumberInput
                                label="Number of children given MNP (no filter)"
                                value={data.mnp_given}
                                onChange={(value) => handleChange('mnp_given', value)}
                            />
                        </div>
                    </div>
                    
                    {/* Section 11: Breastfeeding & Counseling */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-2 mb-4">
                            <Baby className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">11. Breastfeeding & MIYCF Counseling</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <NumberInput
                                label="Total number of children 0-6 months exclusively breastfed (no filter)"
                                value={data.exclusive_breastfeeding_0_6}
                                onChange={(value) => handleChange('exclusive_breastfeeding_0_6', value)}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NumberInput
                                    label="Number of pregnant women counselled on MIYCF"
                                    value={data.miycf_counselled_pregnant_women}
                                    onChange={(value) => handleChange('miycf_counselled_pregnant_women', value)}
                                />
                                
                                <NumberInput
                                    label="Number of other caregivers counselled on MIYCF"
                                    value={data.miycf_counselled_caregivers}
                                    onChange={(value) => handleChange('miycf_counselled_caregivers', value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Comments */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Comments</h3>
                        <textarea
                            value={data.comments}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Enter any additional comments or observations..."
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="text-sm text-gray-600">
                                {isEdit ? (
                                    report.submitted ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CheckCircle size={16} />
                                            This report has been submitted on {new Date(report.submitted_at).toLocaleDateString()}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-600">
                                            <AlertCircle size={16} />
                                            This report is currently in draft status
                                        </div>
                                    )
                                ) : (
                                    <p>All fields marked with * are required</p>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <Link
                                    href={route('phc.nutrition.reports.index')}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </Link>
                                
                                {!isEdit || !report.submitted ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSaveDraft}
                                            disabled={processing}
                                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save as Draft'}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            onClick={handleSaveAndSubmit}
                                            disabled={processing}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                        >
                                            {processing ? 'Submitting...' : 'Save & Submit Report'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={processing}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Report'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </PhcStaffLayout>
    );
}

// Add missing Package icon component
const Package = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
);