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
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection; // Import Collection for type hinting

class PhcStaffController extends Controller
{
    /**
     * Show the form for creating a new patient record.
     */
    public function create()
    {
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
     * Store a new patient record.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Check if user has a PHC assigned
        if (!$user->phc_id) {
            return redirect()->back()
                ->with('error', 'Your account is not associated with any PHC facility. Please contact administrator.');
        }

        $lga = Lga::find($request->lga_id);
        $ward = Ward::find($request->ward_id);

        if (!$lga || !$ward) {
            return redirect()->back()->with('error', 'Invalid LGA or Ward selected.');
        }

        $data = $this->validatePatientData($request);

        return DB::transaction(function () use ($data, $lga, $ward, $user) {
            
            // Unique ID Generation: LGA_CODE/WARD_CODE/SERIAL
            $lga_code = strtoupper(substr($lga->code ?? $lga->name, 0, 3));
            $ward_code = strtoupper(substr($ward->code ?? $ward->name, 0, 3));
            
            // Count patients only within this LGA and Ward for serial generation
            $serial = str_pad(
                Patient::where('lga_id', $data['lga_id'])->where('ward_id', $data['ward_id'])->count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );
            
            $data['unique_id'] = "{$lga_code}/{$ward_code}/{$serial}";
            $data['phc_id'] = $user->phc_id;

            // Handle boolean conversions
            $data = $this->convertBooleanFields($data);

            $patient = Patient::create($data);

            return redirect()->route('phc.create-patient')
                ->with('success', 'Patient registered successfully! Unique ID: ' . $data['unique_id']);
        });
    }

    /**
     * Display all patients for this PHC (Dashboard).
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

        // Add dummy 'alert' field for frontend display (dynamic calculation can be added here)
        $patients = $query->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                        ->latest()
                        ->paginate(10)
                        ->through(function ($patient) {
                            $alert = 'Up to date';
                            $edd = $patient->edd ? Carbon::parse($patient->edd) : null;
                            $now = Carbon::now();

                            if ($edd && $now->gt($edd) && empty($patient->date_of_delivery)) {
                                $alert = 'Overdue Delivery';
                            } elseif (!empty($patient->date_of_delivery) && (!$patient->pnc_visit_1 || !$patient->pnc_visit_2 || !$patient->pnc_visit_3)) {
                                $alert = 'Incomplete PNC';
                            } elseif ($edd && !$patient->anc_visit_8_date && $edd->subMonths(1)->isPast()) { // If 1 month before EDD and ANC8 not done
                                $alert = 'Pending ANC8';
                            }
                            $patient->alert = $alert;
                            return $patient;
                        })
                        ->withQueryString();
        
        // Get comprehensive statistics data
        $phcStats = $this->getPhcStatistics($phcId);
        
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/Dashboard', [
            'patients' => $patients,
            'phcStats' => $phcStats,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display records created by staff in their PHC.
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
        
        $patients = $query->with(['lga:id,name', 'ward:id,name'])
                          ->latest()
                          ->paginate(15)
                          ->through(function ($patient) {
                            $alert = 'Up to date';
                            $edd = $patient->edd ? Carbon::parse($patient->edd) : null;
                            $now = Carbon::now();

                            if ($edd && $now->gt($edd) && empty($patient->date_of_delivery)) {
                                $alert = 'Overdue Delivery';
                            } elseif (!empty($patient->date_of_delivery) && (!$patient->pnc_visit_1 || !$patient->pnc_visit_2 || !$patient->pnc_visit_3)) {
                                $alert = 'Incomplete PNC';
                            } elseif ($edd && !$patient->anc_visit_8_date && $edd->subMonths(1)->isPast()) { // If 1 month before EDD and ANC8 not done
                                $alert = 'Pending ANC8';
                            }
                            $patient->alert = $alert;
                            return $patient;
                        })
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
     * View a single patient record (from own PHC).
     */
    public function show($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)
                         ->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);
        
        return Inertia::render('Phc/ViewPatient', [
            'patient' => $patient
        ]);
    }

    /**
     * Show the form for editing the specified patient (from own PHC).
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
     * Update patient record (for own PHC).
     */
    public function update(Request $request, $id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        
        $data = $this->validatePatientData($request, true);
        $data = $this->convertBooleanFields($data);

        $patient->update($data);

        return back()->with('success', 'Patient updated successfully!');
    }

    /**
     * Delete a patient record (from own PHC).
     */
    public function destroy($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        $patient->delete();

        return back()->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Display all patients across all facilities (for search functionality).
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
            // If no search term, return empty results set
            $query->where('id', 0); // Ensures an empty collection if no search is active
        }

        $patients = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Phc/AllPatients', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * View any patient in the system (read-only for PHC staff).
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
     * Show the form for editing any patient in the system.
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
     * Update any patient record in the system.
     */
    public function updateAnyPatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $data = $this->validatePatientData($request, true);
        $data = $this->convertBooleanFields($data);

        // If it's a cross-facility edit, ensure 'lga_id', 'ward_id', 'health_facility_id' are not updated.
        // The original PHC is preserved in the database regardless of the 'health_facility_id' passed,
        // but frontend prevents changing PHC facility itself.
        if ($patient->phc_id != auth()->user()->phc_id) {
            unset($data['lga_id']);
            unset($data['ward_id']);
            unset($data['health_facility_id']);
        }

        $patient->update($data);

        return redirect()->route('phc.all-patients')->with('success', 'Patient record updated successfully!');
    }

    /**
     * Display statistics for PHC staff.
     */
    public function statistics(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        
        // Get comprehensive statistics
        $phcStats = $this->getPhcStatistics($phcId);
        
        return Inertia::render('Phc/Statistics', [
            'phcStats' => $phcStats,
            'filters' => $request->only(['time_range']),
        ]);
    }

    /**
     * Generate reports for PHC staff.
     */
    public function generateReport(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $reportType = $request->input('report_type', 'pdf_portrait');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $includeDetails = $request->boolean('include_details', true);
        $includeStatistics = $request->boolean('include_statistics', true);

        $query = Patient::where('phc_id', $phcId);

        if ($startDate && $endDate) {
            $query->whereBetween('date_of_registration', [$startDate, $endDate]);
        }

        $patients = $query->with(['lga', 'ward', 'healthFacility'])->get();
        $stats = $this->getPhcStatistics($phcId);

        // For actual report generation, you'd use a package like Dompdf or Spatie/Laravel-Excel
        // This is a placeholder for demonstration
        return response()->json([
            'message' => 'Report generation initiated.',
            'report_type' => $reportType,
            'period' => $startDate && $endDate ? "$startDate to $endDate" : 'All Time',
            'include_details' => $includeDetails,
            'include_statistics' => $includeStatistics,
            'total_records' => $patients->count(),
            'statistics_snapshot' => $stats, // You might only include specific stats
            'generated_at' => now()->toDateTimeString(),
            // In a real app, you'd return a redirect to a download route or a direct download.
            // Example: 'download_url' => route('phc.reports.download', ['type' => $reportType, ...])
        ]);
    }

    /**
     * Get PHC statistics with dynamic trends and all requested breakdowns.
     * @param int $phcId
     * @return array
     */
    private function getPhcStatistics($phcId) : array
    {
        // Fetch all patients for the PHC once to work with a collection
        $patients = Patient::where('phc_id', $phcId)->get();
        $totalPatients = $patients->count();
        $delivered = $patients->whereNotNull('date_of_delivery')->count();

        // Core KPIs
        $facilityDeliveries = $patients->where('place_of_delivery', 'Health Facility')->count();
        $liveBirths = $patients->where('delivery_outcome', 'Live birth')->count();
        $stillbirths = $patients->where('delivery_outcome', 'Stillbirth')->count();
        $miscarriages = $patients->where('delivery_outcome', 'Miscarriage')->count();
        
        $deliveryRate = $totalPatients > 0 ? round(($delivered / $totalPatients) * 100, 1) : 0;
        $facilityDeliveryRate = $delivered > 0 ? round(($facilityDeliveries / $delivered) * 100, 1) : 0;
        
        // Calculate dynamic trends compared to previous period
        $trends = $this->calculateTrends($phcId);

        return [
            'totalPatients' => $totalPatients,
            'delivered' => $delivered,
            'facilityDeliveries' => $facilityDeliveries,
            'liveBirths' => $liveBirths,
            'stillbirths' => $stillbirths,
            'miscarriages' => $miscarriages,
            'deliveryRate' => $deliveryRate,
            'facilityDeliveryRate' => $facilityDeliveryRate,
            
            // Comprehensive breakdowns and aggregated data
            'monthlyRegistrations' => $this->getMonthlyRegistrations($phcId),
            'deliveryOutcomes' => $this->getDeliveryOutcomeDistribution($patients),
            'ancCompletion' => $this->getAncCompletionStats($patients), // Highest ANC visit completed
            'ancVisitsBreakdown' => $this->getAncVisitsBreakdown($patients), // Individual ANC visit counts
            'ancServiceCounts' => $this->getAncServiceCounts($patients),
            'pregnancyTracking' => $this->getPregnancyTrackingStats($patients, $delivered),
            'pncVisitCompletion' => $this->getPncVisitCompletion($patients, $delivered),
            'pncIncomplete' => $this->getPncIncompleteCount($patients, $delivered),
            'hivTestOutcomes' => $this->getHivTestOutcomes($patients),
            'fpUptakeRate' => $totalPatients > 0 ? round(($patients->where('fp_using', true)->count() / $totalPatients) * 100, 1) : 0,
            'fpMethodsUsage' => $this->getFpMethodsDistribution($patients),
            'totalFpUsers' => $patients->where('fp_using', true)->count(),
            'healthInsuranceEnrollment' => $this->getHealthInsuranceEnrollment($patients),
            'immunizationCoverageDetails' => $this->getImmunizationCoverageDetails($patients),
            'literacyStatusDistribution' => $this->getLiteracyStatusDistribution($patients),
            'ageDistribution' => $this->getAgeDistribution($patients),
            'deliveryTypeDistribution' => $this->getDeliveryTypeDistribution($patients),
            'deliveryKitsReceived' => $this->getDeliveryKitsReceivedStats($patients),
            'trends' => $trends,
        ];
    }

    /**
     * Calculate dynamic trends compared to previous period.
     * @param int $phcId
     * @return array
     */
    private function calculateTrends($phcId) : array
    {
        $currentMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        // Current month stats
        $currentMonthStats = Patient::where('phc_id', $phcId)
            ->whereBetween('date_of_registration', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->selectRaw('
                COUNT(*) as total_patients,
                COUNT(CASE WHEN date_of_delivery IS NOT NULL THEN 1 END) as delivered,
                COUNT(CASE WHEN place_of_delivery = "Health Facility" THEN 1 END) as facility_deliveries,
                COUNT(CASE WHEN delivery_outcome = "Live birth" THEN 1 END) as live_births,
                COUNT(CASE WHEN anc_visit_8_date IS NOT NULL THEN 1 END) as anc8_completed,
                COUNT(CASE WHEN fp_using = true THEN 1 END) as fp_users,
                COUNT(CASE WHEN health_insurance_status = "Yes" THEN 1 END) as insured_patients
            ')
            ->first();

        // Last month stats
        $lastMonthStats = Patient::where('phc_id', $phcId)
            ->whereBetween('date_of_registration', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw('
                COUNT(*) as total_patients,
                COUNT(CASE WHEN date_of_delivery IS NOT NULL THEN 1 END) as delivered,
                COUNT(CASE WHEN place_of_delivery = "Health Facility" THEN 1 END) as facility_deliveries,
                COUNT(CASE WHEN delivery_outcome = "Live birth" THEN 1 END) as live_births,
                COUNT(CASE WHEN anc_visit_8_date IS NOT NULL THEN 1 END) as anc8_completed,
                COUNT(CASE WHEN fp_using = true THEN 1 END) as fp_users,
                COUNT(CASE WHEN health_insurance_status = "Yes" THEN 1 END) as insured_patients
            ')
            ->first();

        // Helper for percentage change
        $getChange = function ($current, $last) {
            if ($last == 0) return $current > 0 ? 100 : 0; // If was 0, now more than 0 -> 100% increase
            return round((($current - $last) / $last) * 100, 1);
        };
        
        $trends = [];
        $trends['totalPatients'] = $getChange($currentMonthStats->total_patients, $lastMonthStats->total_patients);

        // Rates need separate calculation for trend
        $currentTotalPatients = $currentMonthStats->total_patients ?? 0;
        $lastTotalPatients = $lastMonthStats->total_patients ?? 0;

        $currentDelivered = $currentMonthStats->delivered ?? 0;
        $lastDelivered = $lastMonthStats->delivered ?? 0;
        $currentDeliveryRate = $currentTotalPatients > 0 ? ($currentDelivered / $currentTotalPatients) * 100 : 0;
        $lastDeliveryRate = $lastTotalPatients > 0 ? ($lastDelivered / $lastTotalPatients) * 100 : 0;
        $trends['deliveryRate'] = round($currentDeliveryRate - $lastDeliveryRate, 1); // Absolute change in rate

        $currentFacilityDeliveries = $currentMonthStats->facility_deliveries ?? 0;
        $lastFacilityDeliveries = $lastMonthStats->facility_deliveries ?? 0;
        $currentFacilityDeliveryRate = $currentDelivered > 0 ? ($currentFacilityDeliveries / $currentDelivered) * 100 : 0;
        $lastFacilityDeliveryRate = $lastDelivered > 0 ? ($lastFacilityDeliveries / $lastDelivered) * 100 : 0;
        $trends['facilityDeliveryRate'] = round($currentFacilityDeliveryRate - $lastFacilityDeliveryRate, 1); // Absolute change in rate

        $trends['liveBirths'] = $getChange($currentMonthStats->live_births, $lastMonthStats->live_births);
        
        $currentAnc8 = $currentMonthStats->anc8_completed ?? 0;
        $lastAnc8 = $lastMonthStats->anc8_completed ?? 0;
        $currentAnc8Rate = $currentTotalPatients > 0 ? ($currentAnc8 / $currentTotalPatients) * 100 : 0;
        $lastAnc8Rate = $lastTotalPatients > 0 ? ($lastAnc8 / $lastTotalPatients) * 100 : 0;
        $trends['anc8CompletionRate'] = round($currentAnc8Rate - $lastAnc8Rate, 1);

        $currentFpUsers = $currentMonthStats->fp_users ?? 0;
        $lastFpUsers = $lastMonthStats->fp_users ?? 0;
        $currentFpUptakeRate = $currentTotalPatients > 0 ? ($currentFpUsers / $currentTotalPatients) * 100 : 0;
        $lastFpUptakeRate = $lastTotalPatients > 0 ? ($lastFpUsers / $lastTotalPatients) * 100 : 0;
        $trends['fpUptakeRate'] = round($currentFpUptakeRate - $lastFpUptakeRate, 1);

        $currentInsured = $currentMonthStats->insured_patients ?? 0;
        $lastInsured = $lastMonthStats->insured_patients ?? 0;
        $currentInsuranceRate = $currentTotalPatients > 0 ? ($currentInsured / $currentTotalPatients) * 100 : 0;
        $lastInsuranceRate = $lastTotalPatients > 0 ? ($lastInsured / $lastTotalPatients) * 100 : 0;
        $trends['insuranceEnrollmentRate'] = round($currentInsuranceRate - $lastInsuranceRate, 1);

        // Placeholder for BCG immunization trend - needs more complex logic if calculated for a period
        $trends['bcgImmunization'] = null; // Or a dummy value like 0 or a small number

        $trends['hivPositiveCases'] = $getChange($this->getHivTestOutcomes(Patient::where('phc_id', $phcId)
                                            ->whereBetween('date_of_registration', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])->get())['Positive'] ?? 0,
                                         $this->getHivTestOutcomes(Patient::where('phc_id', $phcId)
                                            ->whereBetween('date_of_registration', [$lastMonthStart, $lastMonthEnd])->get())['Positive'] ?? 0);

        return $trends;
    }


    /**
     * Calculate pregnancy month based on EDD.
     * @param Patient $patient
     * @return int|null
     */
    private function calculatePregnancyMonth(Patient $patient) : ?int
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        $diffInDays = $edd->diffInDays($now, false); // false for absolute difference

        // If EDD is in the future, calculate months remaining, then subtract from 9
        if ($diffInDays >= 0) {
            $daysToEdd = $diffInDays;
            $monthsToEdd = floor($daysToEdd / 30.44); // Average days in a month, floor to get full months
            $month = 9 - $monthsToEdd;
            return max(1, min(9, (int) $month)); // Ensure it's between 1 and 9
        } else {
            // If EDD is in the past, pregnancy is considered finished, or overdue
            return 9; // Max month, indicating due or overdue
        }
    }

    /**
     * Get ANC visits breakdown for visits 1-8 (robust version).
     * @param Collection $patients
     * @return array
     */
    private function getAncVisitsBreakdown(Collection $patients) : array
    {
        $breakdown = [];
        
        for ($i = 1; $i <= 8; $i++) {
            $fieldName = "anc_visit_{$i}_date";
            $breakdown["anc{$i}"] = $patients->filter(function ($patient) use ($fieldName) {
                $dateValue = $patient->$fieldName;
                return !empty($dateValue) && $dateValue !== null && trim($dateValue) !== '';
            })->count();
        }
        
        // Sum of additional counts, not just count of patients with > 0 additional_anc_count
        $breakdown['anc5plus'] = $patients->sum('additional_anc_count');
        
        return $breakdown;
    }

    /**
     * Get ANC completion stats based on highest visit reached.
     * @param Collection $patients
     * @return array
     */
    private function getAncCompletionStats(Collection $patients) : array
    {
        $stats = [
            'anc1Only' => 0, 'anc2Only' => 0, 'anc3Only' => 0, 'anc4Only' => 0,
            'anc5Only' => 0, 'anc6Only' => 0, 'anc7Only' => 0, 'anc8Completed' => 0,
            'noAnc' => 0,
        ];

        foreach ($patients as $patient) {
            $highestAnc = 0;
            for ($i = 8; $i >= 1; $i--) {
                if (!empty($patient->{"anc_visit_{$i}_date"})) {
                    $highestAnc = $i;
                    break;
                }
            }

            if ($highestAnc > 0) {
                // If the patient has completed ANC8, count them there.
                // Otherwise, count them at their highest completed visit.
                // This logic ensures a patient completing ANC8 isn't also counted in ANC7Only, etc.
                if ($highestAnc == 8) {
                    $stats['anc8Completed']++;
                } else {
                    $stats["anc{$highestAnc}Only"]++;
                }
            } else {
                $stats['noAnc']++;
            }
        }
        return $stats;
    }

    /**
     * Get ANC services provided counts.
     * @param Collection $patients
     * @return array
     */
    private function getAncServiceCounts(Collection $patients) : array
    {
        $serviceCounts = [
            'urinalysis' => 0, 'iron_folate' => 0, 'mms' => 0, 'sp' => 0, 'sba' => 0
        ];

        foreach ($patients as $patient) {
            for ($i = 1; $i <= 8; $i++) {
                if ($patient->{"anc{$i}_urinalysis"}) $serviceCounts['urinalysis']++;
                if ($patient->{"anc{$i}_iron_folate"}) $serviceCounts['iron_folate']++;
                if ($patient->{"anc{$i}_mms"}) $serviceCounts['mms']++;
                if ($patient->{"anc{$i}_sp"}) $serviceCounts['sp']++;
                if ($patient->{"anc{$i}_sba"}) $serviceCounts['sba']++;
            }
        }
        return $serviceCounts;
    }

    /**
     * Get pregnancy tracking statistics.
     * @param Collection $patients
     * @param int $deliveredCount
     * @return array
     */
    private function getPregnancyTrackingStats(Collection $patients, int $deliveredCount) : array
    {
        $activePregnancies = $patients->filter(function ($patient) {
            return !$patient->date_of_delivery && $patient->edd && Carbon::parse($patient->edd)->isFuture();
        })->count();

        $sevenMonths = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 7 && !$patient->date_of_delivery;
        })->count();
        $eightMonths = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 8 && !$patient->date_of_delivery;
        })->count();
        $dueThisMonth = $patients->filter(function ($patient) {
            return $this->isDueThisMonth($patient) && !$patient->date_of_delivery;
        })->count();
        $overdueDeliveries = $patients->filter(function($patient) {
            return !$patient->date_of_delivery && $patient->edd && Carbon::parse($patient->edd)->isPast();
        })->count();

        // High-risk pregnancies: Example criteria (e.g., age <18 or >35, or other medical conditions if available)
        // For demonstration, let's assume a portion of 7/8 month pregnant women are high-risk.
        $highRisk = $patients->filter(function($patient) {
            // Placeholder for actual high-risk logic
            $age = $patient->age;
            $isOlder = $age && $age >= 35;
            $isYounger = $age && $age <= 18;
            $pregnancyMonth = $this->calculatePregnancyMonth($patient);
            
            // Example: High risk if very young/old and in late pregnancy stages
            return (!$patient->date_of_delivery && ($isOlder || $isYounger) && ($pregnancyMonth >= 7 && $pregnancyMonth <=9));
        })->count();

        return [
            'activePregnancies' => $activePregnancies,
            'sevenMonths' => $sevenMonths,
            'eightMonths' => $eightMonths,
            'dueThisMonth' => $dueThisMonth,
            'overdueDeliveries' => $overdueDeliveries,
            'highRisk' => $highRisk,
        ];
    }

    /**
     * Check if patient is due this month.
     * @param Patient $patient
     * @return bool
     */
    private function isDueThisMonth(Patient $patient) : bool
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return false;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $edd->month == $now->month && $edd->year == $now->year;
    }

    /**
     * Get monthly registrations for the current year.
     * @param int $phcId
     * @return array
     */
    private function getMonthlyRegistrations(int $phcId) : array
    {
        return Patient::where('phc_id', $phcId)
            ->select(DB::raw('MONTH(date_of_registration) as month'), DB::raw('count(*) as count'))
            ->whereYear('date_of_registration', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month')
            ->toArray();
    }

    /**
     * Get delivery outcome distribution.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryOutcomeDistribution(Collection $patients) : array
    {
        return $patients->whereNotNull('delivery_outcome')
                        ->countBy('delivery_outcome')
                        ->toArray();
    }

    /**
     * Get PNC visit completion counts.
     * @param Collection $patients
     * @param int $deliveredCount
     * @return array
     */
    private function getPncVisitCompletion(Collection $patients, int $deliveredCount) : array
    {
        $pnc1_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_1')->count();
        $pnc2_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_2')->count();
        $pnc3_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_3')->count();

        return [
            'pnc1_received' => $pnc1_received,
            'pnc2_received' => $pnc2_received,
            'pnc3_received' => $pnc3_received,
            'pnc1_rate' => $deliveredCount > 0 ? round(($pnc1_received / $deliveredCount) * 100, 1) : 0,
            'pnc2_rate' => $deliveredCount > 0 ? round(($pnc2_received / $deliveredCount) * 100, 1) : 0,
            'pnc3_rate' => $deliveredCount > 0 ? round(($pnc3_received / $deliveredCount) * 100, 1) : 0,
        ];
    }

    /**
     * Get count of delivered patients with incomplete PNCs.
     * @param Collection $patients
     * @param int $deliveredCount
     * @return int
     */
    private function getPncIncompleteCount(Collection $patients, int $deliveredCount) : int
    {
        // A patient has incomplete PNCs if they delivered but at least one of PNC1, PNC2, PNC3 is null
        return $patients->whereNotNull('date_of_delivery')
                        ->filter(function($patient) {
                            return is_null($patient->pnc_visit_1) || is_null($patient->pnc_visit_2) || is_null($patient->pnc_visit_3);
                        })->count();
    }

    /**
     * Get HIV test outcomes.
     * @param Collection $patients
     * @return array
     */
    private function getHivTestOutcomes(Collection $patients) : array
    {
        $outcomes = [
            'Positive' => 0,
            'Negative' => 0,
            'Not Tested' => 0,
            'Results Not Received' => 0,
            'Total Tested' => 0, // Sum of 'Yes' for hiv_test
        ];

        foreach ($patients as $patient) {
            // Aggregate across all 8 ANC visits for a patient
            $patientTested = false; // Track if patient had any HIV test for this aggregation
            for ($i = 1; $i <= 8; $i++) {
                $hivTestField = "anc{$i}_hiv_test";
                $hivResultReceivedField = "anc{$i}_hiv_result_received";
                $hivResultField = "anc{$i}_hiv_result";

                if ($patient->$hivTestField === 'Yes') {
                    $outcomes['Total Tested']++;
                    $patientTested = true;

                    if ($patient->$hivResultReceivedField) {
                        if ($patient->$hivResultField === 'Positive') {
                            $outcomes['Positive']++;
                        } elseif ($patient->$hivResultField === 'Negative') {
                            $outcomes['Negative']++;
                        }
                    } else {
                        $outcomes['Results Not Received']++;
                    }
                }
            }
            // If a patient was never marked 'Yes' for HIV test across all ANCs, they are 'Not Tested'
            if (!$patientTested) {
                 $outcomes['Not Tested']++;
            }
        }
        return $outcomes;
    }

    /**
     * Get family planning methods distribution.
     * @param Collection $patients
     * @return array
     */
    private function getFpMethodsDistribution(Collection $patients) : array
    {
        $methods = [
            'Male Condom' => 0, 'Female Condom' => 0, 'Pill' => 0,
            'Injectable' => 0, 'Implant' => 0, 'IUD' => 0, 'Other' => 0
        ];

        foreach ($patients as $patient) {
            if ($patient->fp_using) {
                if ($patient->fp_male_condom) $methods['Male Condom']++;
                if ($patient->fp_female_condom) $methods['Female Condom']++;
                if ($patient->fp_pill) $methods['Pill']++;
                if ($patient->fp_injectable) $methods['Injectable']++;
                if ($patient->fp_implant) $methods['Implant']++;
                if ($patient->fp_iud) $methods['IUD']++;
                if ($patient->fp_other) $methods['Other']++;
            }
        }
        return array_filter($methods); // Remove methods with 0 count
    }

    /**
     * Get health insurance enrollment statistics.
     * @param Collection $patients
     * @return array
     */
    private function getHealthInsuranceEnrollment(Collection $patients) : array
    {
        $stats = [
            'Enrolled' => 0,
            'Not Enrolled' => 0,
            'Kachima' => 0,
            'NHIS' => 0,
            'Others' => 0,
        ];

        foreach ($patients as $patient) {
            if ($patient->health_insurance_status === 'Yes') {
                $stats['Enrolled']++;
                if (!empty($patient->insurance_type)) {
                    // Normalize 'Others' to a specific key if needed, or handle general 'Other' types
                    $stats[$patient->insurance_type] = ($stats[$patient->insurance_type] ?? 0) + 1;
                }
            } else {
                $stats['Not Enrolled']++;
            }
        }
        return $stats;
    }

    /**
     * Get detailed child immunization coverage.
     * @param Collection $patients
     * @return array
     */
    private function getImmunizationCoverageDetails(Collection $patients) : array
    {
        $childrenCount = $patients->whereNotNull('child_dob')->count();
        $coverage = [];

        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        foreach ($vaccines as $vaccine) {
            $receivedCount = $patients->where("{$vaccine}_received", true)->count();
            $coverage["{$vaccine}_received"] = [
                'count' => $receivedCount,
                'rate' => $childrenCount > 0 ? round(($receivedCount / $childrenCount) * 100, 1) : 0
            ];
        }
        return $coverage;
    }

    /**
     * Get literacy status distribution.
     * @param Collection $patients
     * @return array
     */
    private function getLiteracyStatusDistribution(Collection $patients) : array
    {
        return $patients->countBy('literacy_status')->toArray();
    }

    /**
     * Get age distribution in ranges.
     * @param Collection $patients
     * @return array
     */
    private function getAgeDistribution(Collection $patients) : array
    {
        $ageGroups = [
            '15-19' => 0, '20-24' => 0, '25-29' => 0, '30-34' => 0,
            '35-39' => 0, '40-44' => 0, '45-50' => 0, 'Other' => 0
        ];

        foreach ($patients as $patient) {
            if ($patient->age >= 15 && $patient->age <= 19) $ageGroups['15-19']++;
            elseif ($patient->age >= 20 && $patient->age <= 24) $ageGroups['20-24']++;
            elseif ($patient->age >= 25 && $patient->age <= 29) $ageGroups['25-29']++;
            elseif ($patient->age >= 30 && $patient->age <= 34) $ageGroups['30-34']++;
            elseif ($patient->age >= 35 && $patient->age <= 39) $ageGroups['35-39']++;
            elseif ($patient->age >= 40 && $patient->age <= 44) $ageGroups['40-44']++;
            elseif ($patient->age >= 45 && $patient->age <= 50) $ageGroups['45-50']++;
            else $ageGroups['Other']++;
        }
        return $ageGroups;
    }

    /**
     * Get delivery type distribution.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryTypeDistribution(Collection $patients) : array
    {
        return $patients->whereNotNull('type_of_delivery')
                        ->countBy('type_of_delivery')
                        ->toArray();
    }

    /**
     * Get delivery kits received statistics.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryKitsReceivedStats(Collection $patients) : array
    {
        $stats = [
            'Yes' => $patients->where('delivery_kits_received', true)->count(),
            'No' => $patients->where('delivery_kits_received', false)->count(),
        ];
        return $stats;
    }

    /**
     * Validate patient data for store and update methods.
     * @param Request $request
     * @param bool $update
     * @return array
     */
    private function validatePatientData(Request $request, bool $update = false) : array
    {
        $rules = [
            // Personal Information
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',

            // Medical Information
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'fp_interest' => 'nullable|in:Yes,No', // Removed trailing comma as it's not a list of choices

            // ANC Visits 1-8
            'additional_anc_count' => 'nullable|integer|min:0',

            // Delivery Details
            'place_of_delivery' => 'nullable|in:Home,Health Facility,Traditional Attendant', // Removed trailing comma
            'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|in:Normal (Vaginal),Cesarean Section,Assisted,Breech', // Removed trailing comma
            'delivery_outcome' => 'nullable|in:Live birth,Stillbirth,Miscarriage', // Removed trailing comma
            'date_of_delivery' => 'nullable|date',

            // Postnatal Checkup
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',
            'pnc_visit_3' => 'nullable|date',

            // Insurance
            'health_insurance_status' => 'nullable|in:Yes,No,Not Enrolled', // Removed trailing comma
            'insurance_type' => 'nullable|in:Kachima,NHIS,Others', // Removed trailing comma
            'insurance_other_specify' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean',

            // Family Planning
            'fp_using' => 'boolean',
            'fp_male_condom' => 'boolean',
            'fp_female_condom' => 'boolean',
            'fp_pill' => 'boolean',
            'fp_injectable' => 'boolean',
            'fp_implant' => 'boolean',
            'fp_iud' => 'boolean',
            'fp_other' => 'boolean',
            'fp_other_specify' => 'nullable|string|max:255',

            // Child Immunization
            'child_name' => 'nullable|string|max:255',
            'child_dob' => 'nullable|date',
            'child_gender' => 'nullable|in:Male,Female', // Removed trailing comma

            // Notes
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ];

        // Add ANC visit rules for visits 1-8
        for ($i = 1; $i <= 8; $i++) {
            $rules["anc_visit_{$i}_date"] = 'nullable|date';
            $rules["tracked_before_anc{$i}"] = 'boolean';
            $rules["anc{$i}_paid"] = 'boolean';
            $rules["anc{$i}_payment_amount"] = 'nullable|numeric|min:0';
            
            // Services
            $rules["anc{$i}_urinalysis"] = 'boolean';
            $rules["anc{$i}_iron_folate"] = 'boolean';
            $rules["anc{$i}_mms"] = 'boolean';
            $rules["anc{$i}_sp"] = 'boolean';
            $rules["anc{$i}_sba"] = 'boolean';
            
            // HIV Testing
            $rules["anc{$i}_hiv_test"] = 'nullable|in:Yes,No'; // Removed trailing comma
            $rules["anc{$i}_hiv_result_received"] = 'boolean';
            $rules["anc{$i}_hiv_result"] = 'nullable|in:Positive,Negative'; // Removed trailing comma
        }

        // Add vaccine rules
        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        foreach ($vaccines as $vaccine) {
            $rules["{$vaccine}_received"] = 'boolean';
            $rules["{$vaccine}_date"] = 'nullable|date';
        }

        return $request->validate($rules);
    }

    /**
     * Convert boolean fields.
     * @param array $data
     * @return array
     */
    private function convertBooleanFields(array $data) : array
    {
        // Generate ANC boolean fields for visits 1-8
        $ancBooleanFields = [];
        for ($i = 1; $i <= 8; $i++) {
            $ancBooleanFields = array_merge($ancBooleanFields, [
                "tracked_before_anc{$i}",
                "anc{$i}_paid",
                "anc{$i}_urinalysis",
                "anc{$i}_iron_folate", 
                "anc{$i}_mms", 
                "anc{$i}_sp", 
                "anc{$i}_sba", 
                "anc{$i}_hiv_result_received"
            ]);
        }
        
        $otherBooleanFields = [
            // Delivery & Insurance
            'delivery_kits_received', 'insurance_satisfaction',
            
            // Family Planning
            'fp_using', 'fp_male_condom', 'fp_female_condom', 'fp_pill', 
            'fp_injectable', 'fp_implant', 'fp_iud', 'fp_other',
            
            // Vaccines
            'bcg_received', 'hep0_received', 'opv0_received', 'penta1_received',
            'pcv1_received', 'opv1_received', 'rota1_received', 'ipv1_received',
            'penta2_received', 'pcv2_received', 'rota2_received', 'opv2_received',
            'penta3_received', 'pcv3_received', 'opv3_received', 'rota3_received',
            'ipv2_received', 'measles_received', 'yellow_fever_received',
            'vitamin_a_received', 'mcv2_received'
        ];

        $booleanFields = array_merge($ancBooleanFields, $otherBooleanFields);

        foreach ($booleanFields as $field) {
            // Check if the field exists in the request data, then cast
            if (array_key_exists($field, $data)) {
                $data[$field] = (bool)($data[$field] ?? false);
            }
        }

        return $data;
    }
}