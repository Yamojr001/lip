<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('StatisticsController accessed', $request->all());
        
        $lgaId = $request->input('lga_id', 'all');
        $wardId = $request->input('ward_id', 'all');
        $phcId = $request->input('phc_id', 'all');
        $startDate = $request->input('start_date', now()->subYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $query = Patient::query();

        if ($lgaId !== 'all') $query->where('lga_id', $lgaId);
        if ($wardId !== 'all') $query->where('ward_id', $wardId);
        if ($phcId !== 'all') $query->where('health_facility_id', $phcId);
        
        $query->whereBetween('date_of_registration', [$startDate, $endDate]);
        $patients = $query->get();

        \Log::info('Patients count: ' . $patients->count());

        // Calculate all statistics
        $overviewStats = $this->calculateOverviewStatistics($patients);
        $ancData = $this->calculateAncStatistics($patients);
        $deliveryData = $this->calculateDeliveryStatistics($patients);
        $immunizationData = $this->calculateImmunizationStatistics($patients);
        $fpData = $this->calculateFamilyPlanningStatistics($patients);
        $hivData = $this->calculateHivStatistics($patients);
        $facilityStats = $this->calculateFacilityStatistics($patients);

        $responseData = [
            'statistics' => $overviewStats,
            'chartData' => $this->generateChartData($patients, $startDate, $endDate),
            'currentYear' => now()->year,
            'patients' => $patients->count(),
            'facilities' => Phc::count(),
            
            // Tab-specific data
            'ancData' => $ancData,
            'deliveryData' => $deliveryData,
            'immunizationData' => $immunizationData,
            'fpData' => $fpData,
            'hivData' => $hivData,
            'facilityStats' => $facilityStats,
            
            'dropdowns' => [
                'lgas' => Lga::all(['id', 'name']),
                'wards' => Ward::all(['id', 'lga_id', 'name']),
                'phcs' => Phc::all(['id', 'ward_id', 'clinic_name']),
            ],
            'filters' => [
                'lga_id' => $lgaId,
                'ward_id' => $wardId,
                'phc_id' => $phcId,
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
        ];

        return Inertia::render('Admin/Statistics', $responseData);
    }

    /**
     * Calculate overview statistics for the main dashboard
     */
    private function calculateOverviewStatistics($patients)
    {
        $totalRegistered = $patients->count();
        if ($totalRegistered === 0) {
            return $this->getEmptyStatistics();
        }

        // ANC Statistics
        $anc4Completed = $patients->filter(function ($patient) {
            return $this->hasCompletedAncVisit($patient, 4);
        })->count();

        $anc8Completed = $patients->filter(function ($patient) {
            return $this->hasCompletedAncVisit($patient, 8);
        })->count();

        $anc4Rate = $totalRegistered > 0 ? round(($anc4Completed / $totalRegistered) * 100, 1) : 0;
        $anc8Rate = $totalRegistered > 0 ? round(($anc8Completed / $totalRegistered) * 100, 1) : 0;

        // ANC Completion Breakdown
        $ancCompletion = [
            'anc1Only' => $patients->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 1) && !$this->hasCompletedAncVisit($patient, 2);
            })->count(),
            'anc2Only' => $patients->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 2) && !$this->hasCompletedAncVisit($patient, 3);
            })->count(),
            'anc3Only' => $patients->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 3) && !$this->hasCompletedAncVisit($patient, 4);
            })->count(),
            'anc4Completed' => $anc4Completed,
        ];

        // Pregnancy Tracking
        $pregnancyTracking = [
            'sevenMonths' => $patients->filter(function ($patient) {
                return $this->calculatePregnancyMonth($patient) == 7 && !$patient->date_of_delivery;
            })->count(),
            'eightMonths' => $patients->filter(function ($patient) {
                return $this->calculatePregnancyMonth($patient) == 8 && !$patient->date_of_delivery;
            })->count(),
            'dueThisMonth' => $patients->filter(function ($patient) {
                return $this->isDueThisMonth($patient) && !$patient->date_of_delivery;
            })->count(),
        ];

        // Delivery Statistics
        $deliveredPatients = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $deliveredPatients->count();

        $hospitalDeliveries = $deliveredPatients->where('place_of_delivery', 'Health Facility')->count();
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
            return empty($patient->pnc_visit_1) || empty($patient->pnc_visit_2) || empty($patient->pnc_visit_3);
        })->count();

        $stillbirths = $deliveredPatients->where('delivery_outcome', 'Stillbirth')->count();

        // Service Utilization
        $serviceUtilization = [
            'Urinalysis' => $patients->filter(function ($patient) {
                return $this->hasServiceInAnyAnc($patient, 'urinalysis');
            })->count(),
            'Iron Folate' => $patients->filter(function ($patient) {
                return $this->hasServiceInAnyAnc($patient, 'iron_folate');
            })->count(),
            'MMS' => $patients->filter(function ($patient) {
                return $this->hasServiceInAnyAnc($patient, 'mms');
            })->count(),
            'SP' => $patients->filter(function ($patient) {
                return $this->hasServiceInAnyAnc($patient, 'sp');
            })->count(),
            'SBA' => $patients->filter(function ($patient) {
                return $this->hasServiceInAnyAnc($patient, 'sba');
            })->count(),
        ];

        // Calculate real trends based on monthly data
        $trends = $this->calculateRealTrends($patients);

        return [
            'totalRegistered' => $totalRegistered,
            'totalPatients' => $totalRegistered,
            'anc4Rate' => $anc4Rate,
            'anc8Rate' => $anc8Rate,
            'hospitalDeliveryRate' => $hospitalDeliveryRate,
            'facilityDeliveryRate' => $hospitalDeliveryRate,
            'kitsReceivedRate' => $kitsReceivedRate,
            'pnc1Within48hRate' => $pnc1Within48hRate,
            'liveBirthRate' => $liveBirthRate,
            'immunizationRate' => $this->calculateOverallImmunizationRate($patients),
            'bcgImmunizationRate' => $this->calculateVaccineRate($patients, 'bcg'),
            'fpUptakeRate' => $this->calculateFpUptakeRate($patients),
            
            // ANC Completion Breakdown
            'ancCompletion' => $ancCompletion,
            
            // Pregnancy Tracking
            'pregnancyTracking' => $pregnancyTracking,
            
            // Service Utilization
            'serviceUtilization' => $serviceUtilization,
            
            // Alert counts
            'pendingAnc8' => $patients->filter(function ($patient) {
                return !$this->hasCompletedAncVisit($patient, 8) && $this->shouldHaveCompletedAnc8($patient);
            })->count(),
            'overdueDeliveries' => $patients->filter(function ($patient) {
                return $this->isOverdueDelivery($patient);
            })->count(),
            'highRiskPregnancies' => $patients->filter(function ($patient) {
                return $this->isHighRiskPregnancy($patient);
            })->count(),
            
            'detailedCounts' => [
                'anc4Completed' => $anc4Completed,
                'anc8Completed' => $anc8Completed,
                'totalDelivered' => $totalDelivered,
                'pncIncomplete' => $pncIncomplete,
                'stillbirths' => $stillbirths,
                'liveBirths' => $liveBirths,
                'hospitalDeliveries' => $hospitalDeliveries,
                'kitsReceived' => $kitsReceived,
                'pnc1Within48h' => $pnc1Within48h,
            ],
            
            'trends' => $trends
        ];
    }

    /**
     * Calculate ANC-specific statistics
     */
    private function calculateAncStatistics($patients)
    {
        $totalPatients = $patients->count();
        $ancVisits = [];
        $services = [];
        $payments = [];
        $additionalAnc = 0;

        // Calculate ANC visit completion
        for ($i = 1; $i <= 8; $i++) {
            $completed = $patients->filter(function ($patient) use ($i) {
                return $this->hasCompletedAncVisit($patient, $i);
            })->count();
            
            $rate = $totalPatients > 0 ? round(($completed / $totalPatients) * 100, 1) : 0;
            
            $ancVisits["anc{$i}"] = [
                'completed' => $completed,
                'rate' => $rate
            ];

            // Calculate services for this ANC visit
            $services["anc{$i}_urinalysis"] = $patients->where("anc{$i}_urinalysis", true)->count();
            $services["anc{$i}_iron_folate"] = $patients->where("anc{$i}_iron_folate", true)->count();
            $services["anc{$i}_mms"] = $patients->where("anc{$i}_mms", true)->count();
            $services["anc{$i}_sp"] = $patients->where("anc{$i}_sp", true)->count();
            $services["anc{$i}_sba"] = $patients->where("anc{$i}_sba", true)->count();

            // Calculate payments for this ANC visit
            $paidCount = $patients->where("anc{$i}_paid", true)->count();
            $totalAmount = $patients->sum("anc{$i}_payment_amount");
            $averageAmount = $paidCount > 0 ? round($totalAmount / $paidCount, 2) : 0;

            $payments["anc{$i}"] = [
                'paid_count' => $paidCount,
                'total_amount' => $totalAmount,
                'average_amount' => $averageAmount
            ];
        }

        // Additional ANC visits
        $additionalAnc = $patients->sum('additional_anc_count');

        return [
            'totalPatients' => $totalPatients,
            'ancVisits' => $ancVisits,
            'services' => $services,
            'payments' => $payments,
            'additionalAnc' => $additionalAnc
        ];
    }

    /**
     * Calculate delivery statistics
     */
    private function calculateDeliveryStatistics($patients)
    {
        $deliveredPatients = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $deliveredPatients->count();

        $deliveryTypes = $deliveredPatients->groupBy('type_of_delivery')->map->count();
        $deliveryOutcomes = $deliveredPatients->groupBy('delivery_outcome')->map->count();
        $deliveryLocations = $deliveredPatients->groupBy('place_of_delivery')->map->count();

        return [
            'totalDelivered' => $totalDelivered,
            'deliveryTypes' => $deliveryTypes,
            'deliveryOutcomes' => $deliveryOutcomes,
            'deliveryLocations' => $deliveryLocations,
            'deliveryTiming' => $this->calculateDeliveryTiming($deliveredPatients),
            'kitsReceived' => $deliveredPatients->where('delivery_kits_received', true)->count(),
            'facilityDeliveries' => $deliveredPatients->where('place_of_delivery', 'Health Facility')->count(),
            'homeDeliveries' => $deliveredPatients->where('place_of_delivery', 'Home')->count(),
            'traditionalDeliveries' => $deliveredPatients->where('place_of_delivery', 'Traditional Attendant')->count(),
        ];
    }

    /**
     * Calculate immunization statistics
     */
    private function calculateImmunizationStatistics($patients)
    {
        $childrenWithDob = $patients->whereNotNull('child_dob')->count();
        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        $vaccineData = [];
        foreach ($vaccines as $vaccine) {
            $received = $patients->where("{$vaccine}_received", true)->count();
            $rate = $childrenWithDob > 0 ? round(($received / $childrenWithDob) * 100, 1) : 0;
            
            $vaccineData[$vaccine] = [
                'received' => $received,
                'rate' => $rate
            ];
        }

        // Schedule compliance
        $compliance = $this->calculateImmunizationCompliance($patients);

        return [
            'totalChildren' => $childrenWithDob,
            'vaccines' => $vaccineData,
            'scheduleCompliance' => $compliance,
            'timelyVaccination' => $this->calculateTimelyVaccinationRate($patients)
        ];
    }

    /**
     * Calculate family planning statistics
     */
    private function calculateFamilyPlanningStatistics($patients)
    {
        $totalUsers = $patients->where('fp_using', true)->count();
        $uptakeRate = $patients->count() > 0 ? round(($totalUsers / $patients->count()) * 100, 1) : 0;

        $methods = [
            'male_condom' => $patients->where('fp_male_condom', true)->count(),
            'female_condom' => $patients->where('fp_female_condom', true)->count(),
            'pill' => $patients->where('fp_pill', true)->count(),
            'injectable' => $patients->where('fp_injectable', true)->count(),
            'implant' => $patients->where('fp_implant', true)->count(),
            'iud' => $patients->where('fp_iud', true)->count(),
            'other' => $patients->where('fp_other', true)->count(),
        ];

        // Calculate percentages
        foreach ($methods as $method => $count) {
            $methods[$method] = [
                'count' => $count,
                'percentage' => $totalUsers > 0 ? round(($count / $totalUsers) * 100, 1) : 0
            ];
        }

        $fpInterest = $patients->groupBy('fp_interest')->map->count();

        return [
            'totalUsers' => $totalUsers,
            'uptakeRate' => $uptakeRate,
            'methods' => $methods,
            'fpInterest' => $fpInterest,
            'methodCombinations' => $this->calculateMethodCombinations($patients),
            'otherMethods' => $patients->where('fp_other', true)->pluck('fp_other_specify')->filter()->unique()->values()
        ];
    }

    /**
     * Calculate HIV statistics - FIXED VERSION
     */
    private function calculateHivStatistics($patients)
    {
        $totalPatients = $patients->count();
        
        // Track unique patients for each status
        $testedPatients = collect();
        $positivePatients = collect();
        $negativePatients = collect();
        $pendingPatients = collect();

        // Process each patient only once
        foreach ($patients as $patient) {
            $patientTested = false;
            $patientPositive = false;
            $patientNegative = false;
            $patientPending = false;

            // Check all ANC visits for this patient
            for ($i = 1; $i <= 8; $i++) {
                if ($patient->{"anc{$i}_hiv_test"} === "Yes") {
                    $patientTested = true;
                    
                    if ($patient->{"anc{$i}_hiv_result"} === "Positive") {
                        $patientPositive = true;
                    } elseif ($patient->{"anc{$i}_hiv_result"} === "Negative") {
                        $patientNegative = true;
                    } elseif (!$patient->{"anc{$i}_hiv_result_received"}) {
                        $patientPending = true;
                    }
                }
            }

            // Add patient to appropriate collections
            if ($patientTested) {
                $testedPatients->push($patient->id);
                
                if ($patientPositive) {
                    $positivePatients->push($patient->id);
                } elseif ($patientNegative) {
                    $negativePatients->push($patient->id);
                } elseif ($patientPending) {
                    $pendingPatients->push($patient->id);
                }
            }
        }

        // Get unique counts
        $tested = $testedPatients->unique()->count();
        $positive = $positivePatients->unique()->count();
        $negative = $negativePatients->unique()->count();
        $results_pending = $pendingPatients->unique()->count();
        $not_tested = $totalPatients - $tested;

        // Calculate rates
        $testing_rate = $totalPatients > 0 ? round(($tested / $totalPatients) * 100, 1) : 0;
        $positivity_rate = $tested > 0 ? round(($positive / $tested) * 100, 1) : 0;

        // Calculate per-visit breakdown (for informational purposes, but don't sum these)
        $by_anc_visit = [];
        for ($i = 1; $i <= 8; $i++) {
            $visitTested = $patients->where("anc{$i}_hiv_test", "Yes")->count();
            $visitPositive = $patients->where("anc{$i}_hiv_result", "Positive")->count();
            $visitNegative = $patients->where("anc{$i}_hiv_result", "Negative")->count();
            $visitPending = $patients->where("anc{$i}_hiv_result_received", false)
                                ->where("anc{$i}_hiv_test", "Yes")
                                ->count();

            $by_anc_visit["anc{$i}"] = [
                'tested' => $visitTested,
                'positive' => $visitPositive,
                'negative' => $visitNegative,
                'results_pending' => $visitPending
            ];
        }

        return [
            'tested' => $tested,
            'positive' => $positive,
            'negative' => $negative,
            'results_pending' => $results_pending,
            'not_tested' => $not_tested,
            'testing_rate' => $testing_rate,
            'positivity_rate' => $positivity_rate,
            'by_anc_visit' => $by_anc_visit,
            'note' => 'Statistics count unique patients, not individual tests'
        ];
    }

    /**
     * Calculate facility statistics
     */
    private function calculateFacilityStatistics($patients)
    {
        $facilities = Phc::with(['ward', 'ward.lga'])->get();
        
        return $facilities->map(function ($facility) use ($patients) {
            $facilityPatients = $patients->where('health_facility_id', $facility->id);
            $totalPatients = $facilityPatients->count();
            
            $anc4Completed = $facilityPatients->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 4);
            })->count();
            
            $facilityDeliveries = $facilityPatients->where('place_of_delivery', 'Health Facility')
                                                 ->whereNotNull('date_of_delivery')
                                                 ->count();
            
            $totalDelivered = $facilityPatients->whereNotNull('date_of_delivery')->count();
            $fpUsers = $facilityPatients->where('fp_using', true)->count();

            return [
                'id' => $facility->id,
                'facility_name' => $facility->clinic_name,
                'ward' => $facility->ward->name ?? 'Unknown',
                'lga' => $facility->ward->lga->name ?? 'Unknown',
                'total_patients' => $totalPatients,
                'anc4_rate' => $totalPatients > 0 ? round(($anc4Completed / $totalPatients) * 100, 1) : 0,
                'facility_delivery_rate' => $totalDelivered > 0 ? round(($facilityDeliveries / $totalDelivered) * 100, 1) : 0,
                'fp_uptake_rate' => $totalPatients > 0 ? round(($fpUsers / $totalPatients) * 100, 1) : 0,
                'performance_score' => $this->calculateFacilityPerformanceScore($facilityPatients)
            ];
        })->sortByDesc('performance_score')->values();
    }

    /**
     * Generate real chart data from patient records
     */
    private function generateChartData($patients, $startDate, $endDate)
    {
        if ($patients->count() === 0) {
            return $this->getEmptyChartData();
        }

        // Monthly registrations
        $monthlyRegistrations = $patients->groupBy(function ($patient) {
            return Carbon::parse($patient->date_of_registration)->format('Y-m');
        })->map->count();

        // Delivery outcomes
        $deliveryOutcomes = $patients->whereNotNull('delivery_outcome')
            ->groupBy('delivery_outcome')
            ->map->count()
            ->map(function ($count, $outcome) {
                return ['name' => $outcome, 'value' => $count];
            })->values();

        // LGA ANC completion rates
        $lgaAncCompletion = $patients->groupBy('lga_id')->mapWithKeys(function ($lgaPatients, $lgaId) {
            $lgaName = Lga::find($lgaId)->name ?? 'Unknown';
            $total = $lgaPatients->count();
            $anc4Count = $lgaPatients->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 4);
            })->count();
            $rate = $total > 0 ? round(($anc4Count / $total) * 100, 1) : 0;
            return [$lgaName => $rate];
        });

        // ANC progress over time
        $ancProgress = $this->calculateAncProgressOverTime($patients, $startDate, $endDate);

        return [
            'monthlyRegistrations' => $monthlyRegistrations,
            'deliveryOutcomes' => $deliveryOutcomes,
            'lgaAncCompletion' => $lgaAncCompletion,
            'ancProgress' => $ancProgress
        ];
    }

    /**
     * Calculate ANC progress over time
     */
    private function calculateAncProgressOverTime($patients, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        $months = [];
        $current = $start->copy()->startOfMonth();
        
        while ($current <= $end) {
            $monthKey = $current->format('Y-m');
            $monthName = $current->format('M Y');
            
            // Count patients registered by this month who completed ANC4
            $patientsByMonth = $patients->filter(function ($patient) use ($current) {
                return Carbon::parse($patient->date_of_registration) <= $current->endOfMonth();
            });
            
            $anc4Completed = $patientsByMonth->filter(function ($patient) {
                return $this->hasCompletedAncVisit($patient, 4);
            })->count();
            
            $totalPatients = $patientsByMonth->count();
            $rate = $totalPatients > 0 ? round(($anc4Completed / $totalPatients) * 100, 1) : 0;
            
            $months[] = $monthName;
            $actual[] = $rate;
            $target[] = 80; // Standard target of 80% ANC4 completion
            
            $current->addMonth();
        }

        return [
            'months' => $months ?? [],
            'actual' => $actual ?? [],
            'target' => $target ?? []
        ];
    }

    /**
     * Calculate real trends based on monthly comparison
     */
    private function calculateRealTrends($patients)
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        // Current month data
        $currentMonthPatients = $patients->filter(function ($patient) use ($currentMonth, $currentYear) {
            $regDate = Carbon::parse($patient->date_of_registration);
            return $regDate->month == $currentMonth && $regDate->year == $currentYear;
        });
        
        // Previous month data
        $prevMonth = $currentMonth - 1;
        $prevYear = $currentYear;
        if ($prevMonth === 0) {
            $prevMonth = 12;
            $prevYear = $currentYear - 1;
        }
        
        $prevMonthPatients = $patients->filter(function ($patient) use ($prevMonth, $prevYear) {
            $regDate = Carbon::parse($patient->date_of_registration);
            return $regDate->month == $prevMonth && $regDate->year == $prevYear;
        });
        
        // Calculate trends
        $totalPatientsTrend = $this->calculateTrendPercentage($currentMonthPatients->count(), $prevMonthPatients->count());
        $anc8CompletionTrend = $this->calculateTrendPercentage(
            $this->calculateCompletionRate($currentMonthPatients, 8),
            $this->calculateCompletionRate($prevMonthPatients, 8)
        );
        $facilityDeliveryTrend = $this->calculateTrendPercentage(
            $this->calculateFacilityDeliveryRate($currentMonthPatients),
            $this->calculateFacilityDeliveryRate($prevMonthPatients)
        );
        $bcgImmunizationTrend = $this->calculateTrendPercentage(
            $this->calculateVaccineRate($currentMonthPatients, 'bcg'),
            $this->calculateVaccineRate($prevMonthPatients, 'bcg')
        );
        $fpUptakeTrend = $this->calculateTrendPercentage(
            $this->calculateFpUptakeRate($currentMonthPatients),
            $this->calculateFpUptakeRate($prevMonthPatients)
        );

        return [
            'totalPatients' => $totalPatientsTrend,
            'anc8CompletionRate' => $anc8CompletionTrend,
            'facilityDeliveryRate' => $facilityDeliveryTrend,
            'bcgImmunization' => $bcgImmunizationTrend,
            'fpUptakeRate' => $fpUptakeTrend,
        ];
    }

    /**
     * Calculate trend percentage between current and previous values
     */
    private function calculateTrendPercentage($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Calculate completion rate for a specific ANC visit
     */
    private function calculateCompletionRate($patients, $visitNumber)
    {
        $total = $patients->count();
        if ($total === 0) return 0;
        
        $completed = $patients->filter(function ($patient) use ($visitNumber) {
            return $this->hasCompletedAncVisit($patient, $visitNumber);
        })->count();
        
        return round(($completed / $total) * 100, 1);
    }

    /**
     * Calculate facility delivery rate
     */
    private function calculateFacilityDeliveryRate($patients)
    {
        $delivered = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $delivered->count();
        if ($totalDelivered === 0) return 0;
        
        $facilityDeliveries = $delivered->where('place_of_delivery', 'Health Facility')->count();
        return round(($facilityDeliveries / $totalDelivered) * 100, 1);
    }

    // Helper methods...

    private function hasCompletedAncVisit($patient, $visitNumber)
    {
        return !empty($patient->{"anc_visit_{$visitNumber}_date"});
    }

    private function hasServiceInAnyAnc($patient, $service)
    {
        for ($i = 1; $i <= 8; $i++) {
            if ($patient->{"anc{$i}_{$service}"}) {
                return true;
            }
        }
        return false;
    }

    private function calculatePregnancyMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        $totalPregnancyDays = 280;
        $daysPassed = $totalPregnancyDays - $now->diffInDays($edd, false);
        
        if ($daysPassed <= 0) return 9;
        if ($daysPassed > 280) return 1;
        
        return (int) ceil($daysPassed / 30.44);
    }

    private function isDueThisMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return false;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $edd->month == $now->month && $edd->year == $now->year;
    }

    private function calculateOverallImmunizationRate($patients)
    {
        $childrenWithDob = $patients->whereNotNull('child_dob')->count();
        if ($childrenWithDob === 0) return 0;

        $fullyImmunized = $patients->filter(function ($patient) {
            return $this->isFullyImmunized($patient);
        })->count();

        return round(($fullyImmunized / $childrenWithDob) * 100, 1);
    }

    private function calculateVaccineRate($patients, $vaccine)
    {
        $childrenWithDob = $patients->whereNotNull('child_dob')->count();
        if ($childrenWithDob === 0) return 0;

        $received = $patients->where("{$vaccine}_received", true)->count();
        return round(($received / $childrenWithDob) * 100, 1);
    }

    private function calculateFpUptakeRate($patients)
    {
        $total = $patients->count();
        if ($total === 0) return 0;

        $fpUsers = $patients->where('fp_using', true)->count();
        return round(($fpUsers / $total) * 100, 1);
    }

    private function getEmptyStatistics()
    {
        return [
            'totalRegistered' => 0,
            'totalPatients' => 0,
            'anc4Rate' => 0,
            'anc8Rate' => 0,
            'hospitalDeliveryRate' => 0,
            'facilityDeliveryRate' => 0,
            'kitsReceivedRate' => 0,
            'pnc1Within48hRate' => 0,
            'liveBirthRate' => 0,
            'immunizationRate' => 0,
            'bcgImmunizationRate' => 0,
            'fpUptakeRate' => 0,
            'ancCompletion' => ['anc1Only' => 0, 'anc2Only' => 0, 'anc3Only' => 0, 'anc4Completed' => 0],
            'pregnancyTracking' => ['sevenMonths' => 0, 'eightMonths' => 0, 'dueThisMonth' => 0],
            'serviceUtilization' => [],
            'pendingAnc8' => 0,
            'overdueDeliveries' => 0,
            'highRiskPregnancies' => 0,
            'detailedCounts' => [
                'anc4Completed' => 0, 'anc8Completed' => 0, 'totalDelivered' => 0,
                'pncIncomplete' => 0, 'stillbirths' => 0, 'liveBirths' => 0,
                'hospitalDeliveries' => 0, 'kitsReceived' => 0, 'pnc1Within48h' => 0
            ],
            'trends' => [
                'totalPatients' => 0, 'anc8CompletionRate' => 0, 'facilityDeliveryRate' => 0,
                'bcgImmunization' => 0, 'fpUptakeRate' => 0
            ]
        ];
    }

    private function getEmptyChartData()
    {
        return [
            'monthlyRegistrations' => [],
            'deliveryOutcomes' => [],
            'lgaAncCompletion' => [],
            'ancProgress' => [
                'months' => [],
                'actual' => [],
                'target' => []
            ]
        ];
    }

    // Additional helper methods for specific calculations
    private function calculateDeliveryTiming($deliveredPatients)
    {
        $timing = [
            'very_early' => 0,
            'early' => 0,
            'on_time' => 0,
            'late' => 0,
            'very_late' => 0
        ];

        foreach ($deliveredPatients as $patient) {
            if (!$patient->edd || !$patient->date_of_delivery) continue;
            
            $edd = Carbon::parse($patient->edd);
            $delivery = Carbon::parse($patient->date_of_delivery);
            $daysDifference = $delivery->diffInDays($edd, false);
            
            if ($daysDifference < -21) $timing['very_early']++;
            else if ($daysDifference < -7) $timing['early']++;
            else if ($daysDifference <= 7) $timing['on_time']++;
            else if ($daysDifference <= 21) $timing['late']++;
            else $timing['very_late']++;
        }

        return $timing;
    }

    private function calculateImmunizationCompliance($patients)
    {
        $children = $patients->whereNotNull('child_dob');
        $totalChildren = $children->count();
        
        if ($totalChildren === 0) {
            return [
                'fully_compliant' => 0,
                'fully_compliant_rate' => 0,
                'partially_compliant' => 0,
                'partially_compliant_rate' => 0,
                'non_compliant' => 0,
                'non_compliant_rate' => 0
            ];
        }

        $fullyCompliant = $children->filter(function ($patient) {
            return $this->isFullyImmunized($patient);
        })->count();

        $partiallyCompliant = $children->filter(function ($patient) {
            return $this->hasSomeVaccinations($patient) && !$this->isFullyImmunized($patient);
        })->count();

        $nonCompliant = $totalChildren - $fullyCompliant - $partiallyCompliant;

        return [
            'fully_compliant' => $fullyCompliant,
            'fully_compliant_rate' => round(($fullyCompliant / $totalChildren) * 100, 1),
            'partially_compliant' => $partiallyCompliant,
            'partially_compliant_rate' => round(($partiallyCompliant / $totalChildren) * 100, 1),
            'non_compliant' => $nonCompliant,
            'non_compliant_rate' => round(($nonCompliant / $totalChildren) * 100, 1)
        ];
    }

    private function calculateTimelyVaccinationRate($patients)
    {
        $children = $patients->whereNotNull('child_dob');
        $totalChildren = $children->count();
        
        if ($totalChildren === 0) return 0;

        $timelyVaccinated = $children->filter(function ($patient) {
            return $this->hasTimelyVaccinations($patient);
        })->count();

        return round(($timelyVaccinated / $totalChildren) * 100, 1);
    }

    private function calculateMethodCombinations($patients)
    {
        $fpUsers = $patients->where('fp_using', true);
        $combinations = [];

        foreach ($fpUsers as $patient) {
            $methods = [];
            if ($patient->fp_male_condom) $methods[] = 'Male Condom';
            if ($patient->fp_female_condom) $methods[] = 'Female Condom';
            if ($patient->fp_pill) $methods[] = 'Pill';
            if ($patient->fp_injectable) $methods[] = 'Injectable';
            if ($patient->fp_implant) $methods[] = 'Implant';
            if ($patient->fp_iud) $methods[] = 'IUD';
            if ($patient->fp_other) $methods[] = 'Other';

            $combination = implode(' + ', $methods);
            if (!isset($combinations[$combination])) {
                $combinations[$combination] = 0;
            }
            $combinations[$combination]++;
        }

        return $combinations;
    }

    private function calculateFacilityPerformanceScore($facilityPatients)
    {
        $total = $facilityPatients->count();
        if ($total === 0) return 0;

        $anc4Rate = $this->calculateCompletionRate($facilityPatients, 4);
        $facilityDeliveryRate = $this->calculateFacilityDeliveryRate($facilityPatients);
        $fpUptakeRate = $this->calculateFpUptakeRate($facilityPatients);
        $immunizationRate = $this->calculateOverallImmunizationRate($facilityPatients);

        // Weighted average
        return round(($anc4Rate * 0.3) + ($facilityDeliveryRate * 0.3) + ($fpUptakeRate * 0.2) + ($immunizationRate * 0.2), 1);
    }

    private function isFullyImmunized($patient)
    {
        // Define what constitutes fully immunized
        $requiredVaccines = ['bcg', 'penta1', 'penta2', 'penta3', 'opv1', 'opv2', 'opv3', 'ipv1', 'measles'];
        
        foreach ($requiredVaccines as $vaccine) {
            if (!$patient->{"{$vaccine}_received"}) {
                return false;
            }
        }
        return true;
    }

    private function hasSomeVaccinations($patient)
    {
        $vaccines = ['bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1'];
        
        foreach ($vaccines as $vaccine) {
            if ($patient->{"{$vaccine}_received"}) {
                return true;
            }
        }
        return false;
    }

    private function hasTimelyVaccinations($patient)
    {
        if (!$patient->child_dob) return false;

        $birthDate = Carbon::parse($patient->child_dob);
        $now = Carbon::now();
        $ageInWeeks = $birthDate->diffInWeeks($now);

        // Check if key vaccinations were received on time
        $timely = true;

        if ($patient->bcg_received && $patient->bcg_date) {
            $bcgAge = $birthDate->diffInWeeks(Carbon::parse($patient->bcg_date));
            if ($bcgAge > 6) $timely = false; // BCG should be within 6 weeks
        }

        if ($patient->penta1_received && $patient->penta1_date) {
            $penta1Age = $birthDate->diffInWeeks(Carbon::parse($patient->penta1_date));
            if ($penta1Age > 10) $timely = false; // Penta1 should be within 10 weeks
        }

        return $timely;
    }

    private function shouldHaveCompletedAnc8($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) return false;

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        // If EDD has passed or is very close, should have completed ANC8
        return $now->diffInDays($edd, false) <= 14;
    }

    private function isOverdueDelivery($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) return false;

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $now->greaterThan($edd->addDays(14)); // 2 weeks past EDD
    }

    private function isHighRiskPregnancy($patient)
    {
        // Define high-risk criteria
        $highRisk = false;

        // Age-based risk
        if ($patient->age < 18 || $patient->age > 35) {
            $highRisk = true;
        }

        // Gravida/Parity based risk
        if ($patient->gravida > 5) {
            $highRisk = true;
        }

        // HIV positive
        for ($i = 1; $i <= 8; $i++) {
            if ($patient->{"anc{$i}_hiv_result"} === 'Positive') {
                $highRisk = true;
                break;
            }
        }

        return $highRisk;
    }
}