<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PhcStaffController extends Controller
{

    /**
     * Show the form for editing the specified patient.
     */
    public function edit($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)
                         ->with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/EditPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
    }

    /**
     * Generate reports for the facility
     */
    public function generateReport(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'report_type' => 'required|in:pdf_portrait,pdf_landscape,excel,csv',
            'include_details' => 'boolean',
            'include_statistics' => 'boolean',
        ]);

        // Build query based on date range
        $query = Patient::where('phc_id', $phcId)
            ->with(['lga', 'ward', 'healthFacility']);

        if ($request->start_date && $request->end_date) {
            $query->whereBetween('date_of_registration', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $patients = $query->get();
        $facility = Phc::find($phcId);

        $data = [
            'patients' => $patients,
            'facility' => $facility,
            'date_range' => [
                'start' => $request->start_date,
                'end' => $request->end_date,
            ],
            'report_type' => $request->report_type,
            'include_details' => $request->include_details ?? true,
            'include_statistics' => $request->include_statistics ?? true,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];

        // Return different formats based on request
        switch ($request->report_type) {
            case 'pdf_portrait':
                return $this->generatePdfReport($data, 'portrait');
            case 'pdf_landscape':
                return $this->generatePdfReport($data, 'landscape');
            case 'excel':
                return $this->generateExcelReport($data);
            case 'csv':
                return $this->generateCsvReport($data);
        }
    }

    /**
     * Generate PDF report
     */
    private function generatePdfReport($data, $orientation = 'portrait')
    {
        // You'll need to install and set up a PDF library like DomPDF or Laravel Excel
        // This is a placeholder implementation
        return response()->json([
            'message' => 'PDF generation would be implemented here',
            'data' => $data
        ]);
        
        // Example implementation with DomPDF:
        // $pdf = PDF::loadView('reports.facility-pdf', $data)->setPaper('a4', $orientation);
        // return $pdf->download('facility-report-' . now()->format('Y-m-d') . '.pdf');
    }

    /**
     * Generate Excel report
     */
    private function generateExcelReport($data)
    {
        // You'll need to install and set up Laravel Excel
        // This is a placeholder implementation
        return response()->json([
            'message' => 'Excel generation would be implemented here',
            'data' => $data
        ]);
        
        // Example implementation with Laravel Excel:
        // return Excel::download(new FacilityReportExport($data), 'facility-report-' . now()->format('Y-m-d') . '.xlsx');
    }

    /**
     * Generate CSV report
     */
    private function generateCsvReport($data)
    {
        // Simple CSV implementation
        $fileName = 'facility-report-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        $callback = function() use ($data) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, [
                'Unique ID', 'Name', 'Age', 'Phone', 'LGA', 'Ward', 
                'Registration Date', 'EDD', 'ANC Visits', 'Delivery Outcome'
            ]);

            // Add data rows
            foreach ($data['patients'] as $patient) {
                fputcsv($file, [
                    $patient->unique_id,
                    $patient->woman_name,
                    $patient->age,
                    $patient->phone_number,
                    $patient->lga->name ?? 'N/A',
                    $patient->ward->name ?? 'N/A',
                    $patient->date_of_registration,
                    $patient->edd,
                    $this->calculateAncVisits($patient),
                    $patient->delivery_outcome ?? 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Calculate total ANC visits for a patient
     */
    private function calculateAncVisits($patient)
    {
        $visits = 0;
        if ($patient->anc_visit_1) $visits++;
        if ($patient->anc_visit_2) $visits++;
        if ($patient->anc_visit_3) $visits++;
        if ($patient->anc_visit_4) $visits++;
        return $visits + ($patient->additional_anc_count ?? 0);
    }

    /**
     * Display all patients for this PHC (Dashboard - phc.dashboard).
     */
    public function index(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $query = Patient::query()->where('phc_id', $phcId);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $patients = $query->with(['lga:id,name', 'ward:id,name'])->latest()->paginate(10);
        
        // Get statistics data (SAME AS statistics() method)
        $phcStats = $this->getPhcStatistics($phcId);
        
        // Data needed for the Dashboard component (for display/quick forms)
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']); 

        return Inertia::render('Phc/Dashboard', [
            'patients' => $patients,
            'phcStats' => $phcStats, // ADDED: Same statistics data as statistics page
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Get PHC statistics (reusable method for both dashboard and statistics page)
     */
    private function getPhcStatistics($phcId)
    {
        // 1. Core KPIs
        $totalPatients = Patient::where('phc_id', $phcId)->count();
        $delivered = Patient::where('phc_id', $phcId)->whereNotNull('date_of_delivery')->count();
        $anc4Completed = Patient::where('phc_id', $phcId)->where('anc4_completed', true)->count();
        $liveBirths = Patient::where('phc_id', $phcId)->where('delivery_outcome', 'Live birth')->count();
        
        $deliveryRate = $totalPatients > 0 ? round(($delivered / $totalPatients) * 100) : 0;
        $anc4Rate = $totalPatients > 0 ? round(($anc4Completed / $totalPatients) * 100) : 0;
        
        // 2. Data for Chart (Monthly registrations)
        $monthlyRegData = Patient::where('phc_id', $phcId)
            ->select(DB::raw('MONTH(date_of_registration) as month'), DB::raw('count(*) as count'))
            ->whereYear('date_of_registration', now()->year)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();
            
        // 3. Simple Delivery Outcome distribution
        $deliveryOutcomes = Patient::where('phc_id', $phcId)
            ->select('delivery_outcome', DB::raw('count(*) as count'))
            ->whereNotNull('delivery_outcome')
            ->groupBy('delivery_outcome')
            ->pluck('count', 'delivery_outcome')
            ->toArray();

        return [
            'totalPatients' => $totalPatients,
            'delivered' => $delivered,
            'anc4Completed' => $anc4Completed,
            'liveBirths' => $liveBirths,
            'deliveryRate' => $deliveryRate,
            'anc4Rate' => $anc4Rate,
            'monthlyRegistrations' => $monthlyRegData,
            'deliveryOutcomes' => $deliveryOutcomes,
        ];
    }

    /**
     * Display records created by staff in their PHC with search and pagination.
     */
    public function records(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $query = Patient::query()->where('phc_id', $phcId);

        // Search filter logic
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                  ->orWhere('unique_id', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhereHas('lga', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ward', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        // Paginate and eager load location info
        $patients = $query->with(['lga:id,name', 'ward:id,name'])
                          ->latest()
                          ->paginate(15)
                          ->withQueryString();

        return Inertia::render('Phc/MyRecords', [
            'patients' => $patients,
            'filters' => $request->only('search'),
            'auth' => [
                'user' => auth()->user()
            ],
        ]);
    }

    /**
     * Display all patients across all facilities (PHC staff view with search)
     */
    public function allPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Search filter - only show results when searching
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                  ->orWhere('unique_id', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhereHas('lga', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ward', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('healthFacility', function ($q) use ($search) {
                      $q->where('clinic_name', 'like', "%{$search}%");
                  });
            });
        } else {
            // If no search term, return empty results
            $query->where('id', 0);
        }

        $patients = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Phc/AllPatients', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * View any patient in the system (read-only for PHC staff)
     */
    public function showAllPatient($id)
    {
        $patient = Patient::with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);

        $isCrossFacility = $patient->phc_id != auth()->user()->phc_id;

        return Inertia::render('Phc/ViewAllPatient', [
            'patient' => $patient,
            'isCrossFacility' => $isCrossFacility,
        ]);
    }

    /**
     * Show the form for editing any patient in the system (regardless of facility)
     */
    public function editAnyPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        $isCrossFacility = $patient->phc_id != auth()->user()->phc_id;

        return Inertia::render('Phc/EditAnyPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'isCrossFacility' => $isCrossFacility,
        ]);
    }

    /**
     * Update any patient record in the system (preserves original facility)
     */
    public function updateAnyPatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $data = $request->validate([
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'anc_visit_1' => 'nullable|date', 'tracked_before_anc1' => 'boolean',
            'anc_visit_2' => 'nullable|date', 'tracked_before_anc2' => 'boolean',
            'anc_visit_3' => 'nullable|date', 'tracked_before_anc3' => 'boolean',
            'anc_visit_4' => 'nullable|date', 'tracked_before_anc4' => 'boolean',
            'additional_anc_count' => 'nullable|integer|min:0',
            'place_of_delivery' => 'nullable|string|max:255',
            'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|string|max:255',
            'delivery_outcome' => 'nullable|string|max:255',
            'date_of_delivery' => 'nullable|date',
            'child_immunization_status' => 'nullable|string|max:255',
            'fp_interest_postpartum' => 'boolean',
            'fp_given' => 'boolean',
            'fp_paid' => 'boolean',
            'fp_payment_amount' => 'nullable|numeric|min:0',
            'fp_reason_not_given' => 'nullable|string',
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',
            'health_insurance_status' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean',
            'anc_paid' => 'boolean',
            'anc_payment_amount' => 'nullable|numeric|min:0',
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        // Preserve the original facility - don't update phc_id
        // Remove phc_id from data to prevent changing original registration facility
        if (isset($data['phc_id'])) {
            unset($data['phc_id']);
        }

        $patient->update($data);

        // Return to the all patients search page
        return redirect()->route('phc.all-patients')->with('success', 'Patient record updated successfully! Original facility preserved.');
    }

    /**
     * Show the form for creating a new patient record (phc.create-patient).
     */
    public function create()
    {
        // Fetch data required for the form's cascading dropdowns
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/CreatePatient', [
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
    }

    /**
     * Store a new patient record (phc.patient.store).
     */
    public function store(Request $request)
    {
        $lga = Lga::find($request->lga_id);
        $ward = Ward::find($request->ward_id);

        $data = $request->validate([
            // --- Core Validation ---
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'anc_visit_1' => 'nullable|date', 'tracked_before_anc1' => 'boolean',
            'anc_visit_2' => 'nullable|date', 'tracked_before_anc2' => 'boolean',
            'anc_visit_3' => 'nullable|date', 'tracked_before_anc3' => 'boolean',
            'anc_visit_4' => 'nullable|date', 'tracked_before_anc4' => 'boolean',
            'additional_anc_count' => 'nullable|integer|min:0',
            'place_of_delivery' => 'nullable|string|max:255',
            'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|string|max:255',
            'delivery_outcome' => 'nullable|string|max:255',
            'date_of_delivery' => 'nullable|date',
            'child_immunization_status' => 'nullable|string|max:255',
            'fp_interest_postpartum' => 'boolean',
            'fp_given' => 'boolean',
            'fp_paid' => 'boolean',
            'fp_payment_amount' => 'nullable|numeric|min:0',
            'fp_reason_not_given' => 'nullable|string',
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',
            'health_insurance_status' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean',
            'anc_paid' => 'boolean',
            'anc_payment_amount' => 'nullable|numeric|min:0',
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data, $lga, $ward) {
            
            // Unique ID Generation: LGA_CODE/WARD_CODE/SERIAL
            $lga_code = strtoupper(substr($lga->code ?? 'NLA', 0, 3));
            $ward_code = strtoupper(substr($ward->code ?? 'NWD', 0, 3));
            
            $serial = str_pad(
                Patient::where('lga_id', $data['lga_id'])->where('ward_id', $data['ward_id'])->count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );
            $data['unique_id'] = "{$lga_code}/{$ward_code}/{$serial}";
            $data['phc_id'] = auth()->user()->phc_id;

            Patient::create($data);

            // FIX: Use redirect()->route() to ensure Inertia gets the flash message reliably.
            return redirect()->route('phc.create-patient')->with('success', 'Patient registered successfully! Unique ID: ' . $data['unique_id']);
        });
    }

    /**
     * View a single patient record (phc.patients.show).
     */
    public function show($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)
                         ->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);
        return Inertia::render('Phc/ViewPatient', ['patient' => $patient]);
    }
    
    /**
     * Update patient record (phc.patients.update).
     */
    public function update(Request $request, $id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        
        $data = $request->validate([
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'anc_visit_1' => 'nullable|date', 'tracked_before_anc1' => 'boolean',
            'anc_visit_2' => 'nullable|date', 'tracked_before_anc2' => 'boolean',
            'anc_visit_3' => 'nullable|date', 'tracked_before_anc3' => 'boolean',
            'anc_visit_4' => 'nullable|date', 'tracked_before_anc4' => 'boolean',
            'additional_anc_count' => 'nullable|integer|min:0',
            'place_of_delivery' => 'nullable|string|max:255',
            'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|string|max:255',
            'delivery_outcome' => 'nullable|string|max:255',
            'date_of_delivery' => 'nullable|date',
            'child_immunization_status' => 'nullable|string|max:255',
            'fp_interest_postpartum' => 'boolean',
            'fp_given' => 'boolean',
            'fp_paid' => 'boolean',
            'fp_payment_amount' => 'nullable|numeric|min:0',
            'fp_reason_not_given' => 'nullable|string',
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',
            'health_insurance_status' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean',
            'anc_paid' => 'boolean',
            'anc_payment_amount' => 'nullable|numeric|min:0',
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        $patient->update($data);

        return back()->with('success', 'Patient updated successfully!');
    }

    /**
     * Delete a patient record (phc.patients.destroy).
     */
    public function destroy($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        $patient->delete();

        return back()->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Display statistics for the logged-in PHC (phc.statistics).
     */
    public function statistics()
    {
        $phcId = auth()->user()->phc_id;
        $phcStats = $this->getPhcStatistics($phcId);

        return Inertia::render('Phc/Statistics', [
            'phcStats' => $phcStats
        ]);
    }
}
