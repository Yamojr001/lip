<?php

namespace App\Http\Controllers;

use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    // Render Admin Dashboard Home with Comprehensive Statistics
    public function index()
    {
        // Get current year range
        $currentYear = now()->year;
        $startDate = $currentYear . '-01-01';
        $endDate = $currentYear . '-12-31';

        // Get all patients for current year
        $patients = Patient::whereBetween('date_of_registration', [$startDate, $endDate])->get();

        // Calculate comprehensive statistics
        $stats = $this->calculateStatistics($patients);
        $chartData = $this->generateChartData($patients, $currentYear);

        // Get basic stats for dashboard
        $totalPatients = Patient::count();
        $totalFacilities = Phc::count();
        $totalStaff = User::where('role', 'phc_staff')->count();
        $recentPatients = Patient::with(['lga', 'ward', 'healthFacility'])
                                ->latest()
                                ->take(5)
                                ->get();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => $stats,
            'chartData' => $chartData,
            'dropdowns' => [
                'lgas' => Lga::all(['id', 'name']),
                'wards' => Ward::all(['id', 'lga_id', 'name']),
                'phcs' => Phc::all(['id', 'ward_id', 'clinic_name']),
            ],
            'currentYear' => $currentYear,
            'stats' => [
                'totalPatients' => $totalPatients,
                'totalFacilities' => $totalFacilities,
                'totalStaff' => $totalStaff,
                'recentPatients' => $recentPatients,
            ],
        ]);
    }

    private function calculateStatistics($patients)
    {
        $totalRegistered = $patients->count();
        
        // ANC Statistics
        $anc4Completed = $patients->where('anc_visits_count', '>=', 4)->count();
        $anc4Rate = $totalRegistered > 0 ? round(($anc4Completed / $totalRegistered) * 100, 1) : 0;

        // Delivery Statistics
        $deliveredPatients = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $deliveredPatients->count();

        $hospitalDeliveries = $deliveredPatients->filter(function ($patient) {
            return in_array($patient->place_of_delivery, ['PHC', 'Hospital', 'Secondary', 'Tertiary']);
        })->count();

        $hospitalDeliveryRate = $totalDelivered > 0 ? round(($hospitalDeliveries / $totalDelivered) * 100, 1) : 0;

        // Delivery Kits
        $kitsReceived = $deliveredPatients->where('delivery_kits_received', true)->count();
        $kitsReceivedRate = $totalDelivered > 0 ? round(($kitsReceived / $totalDelivered) * 100, 1) : 0;

        // PNC Statistics
        $pnc1Within48h = $deliveredPatients->filter(function ($patient) {
            return $patient->date_of_delivery && $patient->pnc_visit_1 && 
                   Carbon::parse($patient->pnc_visit_1)->diffInHours(Carbon::parse($patient->date_of_delivery)) <= 48;
        })->count();

        $pnc1Within48hRate = $totalDelivered > 0 ? round(($pnc1Within48h / $totalDelivered) * 100, 1) : 0;

        // Birth Outcomes
        $liveBirths = $deliveredPatients->where('delivery_outcome', 'Live birth')->count();
        $liveBirthRate = $totalDelivered > 0 ? round(($liveBirths / $totalDelivered) * 100, 1) : 0;

        // Additional Metrics
        $pncIncomplete = $deliveredPatients->filter(function ($patient) {
            return empty($patient->pnc_visit_1) || empty($patient->pnc_visit_2);
        })->count();

        $stillbirths = $deliveredPatients->where('delivery_outcome', 'Stillbirth')->count();

        return [
            'totalRegistered' => $totalRegistered,
            'anc4Rate' => $anc4Rate,
            'hospitalDeliveryRate' => $hospitalDeliveryRate,
            'kitsReceivedRate' => $kitsReceivedRate,
            'pnc1Within48hRate' => $pnc1Within48hRate,
            'liveBirthRate' => $liveBirthRate,
            'detailedCounts' => [
                'anc4Completed' => $anc4Completed,
                'totalDelivered' => $totalDelivered,
                'pncIncomplete' => $pncIncomplete,
                'stillbirths' => $stillbirths,
                'liveBirths' => $liveBirths,
                'hospitalDeliveries' => $hospitalDeliveries,
                'kitsReceived' => $kitsReceived,
                'pnc1Within48h' => $pnc1Within48h,
            ]
        ];
    }

    private function generateChartData($patients, $currentYear)
    {
        // If no patients, return empty data structure
        if ($patients->count() === 0) {
            return [
                'monthlyRegistrations' => [],
                'deliveryOutcomes' => [],
                'lgaAncCompletion' => [],
                'ancProgress' => [
                    'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    'actual' => array_fill(0, 12, 0),
                    'target' => array_fill(0, 12, 25)
                ]
            ];
        }

        // Monthly Registrations
        $monthlyRegistrations = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthKey = $currentYear . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $count = $patients->filter(function ($patient) use ($month, $currentYear) {
                return Carbon::parse($patient->date_of_registration)->month == $month &&
                       Carbon::parse($patient->date_of_registration)->year == $currentYear;
            })->count();
            $monthlyRegistrations[$monthKey] = $count;
        }

        // Delivery Outcomes
        $deliveryOutcomes = $patients->whereNotNull('delivery_outcome')
            ->groupBy('delivery_outcome')
            ->map->count()
            ->toArray();

        // LGA ANC Completion
        $lgaAncCompletion = [];
        $patientsByLga = $patients->groupBy('lga_id');
        
        foreach ($patientsByLga as $lgaId => $lgaPatients) {
            $lgaName = Lga::find($lgaId)->name ?? 'Unknown LGA';
            $total = $lgaPatients->count();
            $anc4Count = $lgaPatients->where('anc_visits_count', '>=', 4)->count();
            $rate = $total > 0 ? round(($anc4Count / $total) * 100, 1) : 0;
            
            $lgaAncCompletion[$lgaName] = $rate;
        }

        // ANC Progress (using actual data from monthly registrations)
        $ancProgress = [
            'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            'actual' => array_values($monthlyRegistrations),
            'target' => array_fill(0, 12, 25) // 25% target for each month
        ];

        return [
            'monthlyRegistrations' => $monthlyRegistrations,
            'deliveryOutcomes' => $deliveryOutcomes,
            'lgaAncCompletion' => $lgaAncCompletion,
            'ancProgress' => $ancProgress,
        ];
    }

    // Create a new PHC + Staff Account
    public function createPhc(Request $request)
    {
        $validated = $request->validate([
            'clinic_name' => 'required|string|max:255',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
        ]);

        // Create PHC
        $phc = Phc::create([
            'clinic_name' => $validated['clinic_name'],
            'lga_id' => $validated['lga_id'],
            'ward_id' => $validated['ward_id'],
        ]);

        // Create PHC Staff
        User::create([
            'name' => $validated['clinic_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'phc_staff',
            'phc_id' => $phc->id,
        ]);

        return back()->with('success', 'PHC and Staff account created successfully!');
    }

    // Fetch all PHCs (API)
    public function getPhcs()
    {
        return response()->json(Phc::with(['lga', 'ward'])->get());
    }

    /**
     * Display all patients across all facilities (Admin view)
     */
    public function allPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Search filter
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
        }

        // Facility filter
        if ($facility = $request->input('facility')) {
            $query->where('health_facility_id', $facility);
        }

        $patients = $query->latest()->paginate(20)->withQueryString();
        $facilities = Phc::all(['id', 'clinic_name']);

        return Inertia::render('Admin/AllPatients', [
            'patients' => $patients,
            'facilities' => $facilities,
            'filters' => $request->only(['search', 'facility']),
        ]);
    }

    /**
     * Show a specific patient record (Admin view)
     */
    public function showPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        return Inertia::render('Admin/ViewPatient', [
            'patient' => $patient,
        ]);
    }

    /**
     * Show the form for editing a patient record (Admin view)
     */
    public function editPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Admin/EditPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
    }

    /**
     * Update a patient record (Admin view)
     */
    public function updatePatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $data = $request->validate([
            // Same validation rules as PhcStaffController
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

        return redirect()->route('admin.patients.index')->with('success', 'Patient record updated successfully!');
    }

    /**
     * Delete a patient record (Admin view)
     */
    public function destroyPatient($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();

        return redirect()->route('admin.patients.index')->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Export patients data
     */
    public function exportPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Apply filters
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
        }

        if ($facility = $request->input('facility')) {
            $query->where('health_facility_id', $facility);
        }

        $patients = $query->get();

        $fileName = 'all-patients-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        $callback = function() use ($patients) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            
            // Add CSV headers
            fputcsv($file, [
                'Unique ID', 'Woman Name', 'Age', 'Literacy Status', 'Phone Number',
                'Husband Name', 'Husband Phone', 'Community', 'Address',
                'LGA', 'Ward', 'Health Facility', 'Gravida', 'Parity',
                'Registration Date', 'EDD', 'ANC Visit 1', 'ANC Visit 2',
                'ANC Visit 3', 'ANC Visit 4', 'Total ANC Visits',
                'Place of Delivery', 'Delivery Outcome', 'Date of Delivery',
                'Delivery Kits Received', 'Child Immunization Status',
                'PNC Visit 1', 'PNC Visit 2', 'Health Insurance Status',
                'ANC Paid', 'ANC Payment Amount', 'FP Interest', 'FP Given',
                'FP Paid', 'FP Payment Amount', 'Alert Status', 'Remark', 'Comments'
            ]);

            // Add data rows
            foreach ($patients as $patient) {
                fputcsv($file, [
                    $patient->unique_id,
                    $patient->woman_name,
                    $patient->age,
                    $patient->literacy_status,
                    $patient->phone_number,
                    $patient->husband_name ?? '',
                    $patient->husband_phone ?? '',
                    $patient->community,
                    $patient->address,
                    $patient->lga->name ?? 'N/A',
                    $patient->ward->name ?? 'N/A',
                    $patient->healthFacility->clinic_name ?? 'N/A',
                    $patient->gravida ?? '',
                    $patient->parity ?? '',
                    $patient->date_of_registration,
                    $patient->edd,
                    $patient->anc_visit_1 ?? '',
                    $patient->anc_visit_2 ?? '',
                    $patient->anc_visit_3 ?? '',
                    $patient->anc_visit_4 ?? '',
                    $this->calculateAncVisits($patient),
                    $patient->place_of_delivery ?? '',
                    $patient->delivery_outcome ?? '',
                    $patient->date_of_delivery ?? '',
                    $patient->delivery_kits_received ? 'Yes' : 'No',
                    $patient->child_immunization_status ?? '',
                    $patient->pnc_visit_1 ?? '',
                    $patient->pnc_visit_2 ?? '',
                    $patient->health_insurance_status,
                    $patient->anc_paid ? 'Yes' : 'No',
                    $patient->anc_payment_amount ?? '',
                    $patient->fp_interest_postpartum ? 'Yes' : 'No',
                    $patient->fp_given ? 'Yes' : 'No',
                    $patient->fp_paid ? 'Yes' : 'No',
                    $patient->fp_payment_amount ?? '',
                    $patient->alert ?? 'N/A',
                    $patient->remark ?? '',
                    $patient->comments ?? ''
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
}