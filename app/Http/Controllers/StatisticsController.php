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
        $startDate = $request->input('start_date', now()->startOfYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $query = Patient::query();

        if ($lgaId !== 'all') $query->where('lga_id', $lgaId);
        if ($wardId !== 'all') $query->where('ward_id', $wardId);
        if ($phcId !== 'all') $query->where('health_facility_id', $phcId);
        
        $query->whereBetween('date_of_registration', [$startDate, $endDate]);
        $patients = $query->get();

        \Log::info('Patients count: ' . $patients->count());
        \Log::info('LGA count: ' . Lga::count());
        \Log::info('Ward count: ' . Ward::count());
        \Log::info('PHC count: ' . Phc::count());

        $stats = $this->calculateComprehensiveStatistics($patients);
        $chartData = $this->generateChartData($patients);

        $responseData = [
            'statistics' => $stats,
            'chartData' => $chartData,
            'dropdowns' => [
                'lgas' => Lga::all(['id', 'name']),
                'wards' => Ward::all(['id', 'lga_id', 'name']),
                'phcs' => Phc::all(['id', 'ward_id', 'clinic_name']),
            ],
            'filters' => compact('lgaId', 'wardId', 'phcId', 'startDate', 'endDate'),
        ];

        \Log::info('Response data prepared', [
            'stats_total' => $stats['totalRegistered'],
            'lgas_count' => count($responseData['dropdowns']['lgas']),
            'wards_count' => count($responseData['dropdowns']['wards']),
            'phcs_count' => count($responseData['dropdowns']['phcs'])
        ]);

        return Inertia::render('Admin/Statistics', $responseData);
    }

    /**
     * Calculate comprehensive statistics including ANC breakdown and pregnancy tracking
     */
    private function calculateComprehensiveStatistics($patients)
    {
        $totalRegistered = $patients->count();
        
        // ANC Statistics
        $anc4Completed = $patients->where('anc_visits_count', '>=', 4)->count();
        $anc4Rate = $totalRegistered > 0 ? round(($anc4Completed / $totalRegistered) * 100, 1) : 0;

        // NEW: ANC Completion Breakdown (Exclusive counts)
        $anc1Only = $patients->filter(function ($patient) {
            return $patient->anc_visit_1 && !$patient->anc_visit_2;
        })->count();
        
        $anc2Only = $patients->filter(function ($patient) {
            return $patient->anc_visit_2 && !$patient->anc_visit_3;
        })->count();
        
        $anc3Only = $patients->filter(function ($patient) {
            return $patient->anc_visit_3 && !$patient->anc_visit_4;
        })->count();

        // NEW: Pregnancy Month Tracking
        $sevenMonthsPregnant = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 7 && !$patient->date_of_delivery;
        })->count();
        
        $eightMonthsPregnant = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 8 && !$patient->date_of_delivery;
        })->count();
        
        $dueThisMonth = $patients->filter(function ($patient) {
            return $this->isDueThisMonth($patient) && !$patient->date_of_delivery;
        })->count();

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
            
            // NEW: ANC Completion Breakdown
            'ancCompletion' => [
                'anc1Only' => $anc1Only,
                'anc2Only' => $anc2Only,
                'anc3Only' => $anc3Only,
                'anc4Completed' => $anc4Completed,
            ],
            
            // NEW: Pregnancy Tracking
            'pregnancyTracking' => [
                'sevenMonths' => $sevenMonthsPregnant,
                'eightMonths' => $eightMonthsPregnant,
                'dueThisMonth' => $dueThisMonth,
            ],
            
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

    /**
     * Calculate pregnancy month based on EDD
     */
    private function calculatePregnancyMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null; // No EDD or already delivered
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        // Pregnancy is typically 9 months (40 weeks)
        $totalPregnancyDays = 280; // 40 weeks * 7 days
        $daysPassed = $totalPregnancyDays - $now->diffInDays($edd, false);
        
        if ($daysPassed <= 0) return 9; // At or past due date
        if ($daysPassed > 280) return 1; // Just started
        
        return (int) ceil($daysPassed / 30.44); // Average days per month
    }

    /**
     * Check if patient is due this month
     */
    private function isDueThisMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return false;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $edd->month == $now->month && $edd->year == $now->year;
    }

    /**
     * Keep the original calculateStatistics method for backward compatibility
     */
    private function calculateStatistics($patients)
    {
        return $this->calculateComprehensiveStatistics($patients);
    }

    private function generateChartData($patients)
    {
        // If no patients, return mock data for demonstration
        if ($patients->count() === 0) {
            return [
                'monthlyRegistrations' => [
                    '2024-01' => 45,
                    '2024-02' => 52,
                    '2024-03' => 48,
                    '2024-04' => 61,
                    '2024-05' => 55,
                    '2024-06' => 58
                ],
                'deliveryOutcomes' => [
                    'Live birth' => 120,
                    'Stillbirth' => 5,
                    'Referral' => 8,
                    'Complication' => 3
                ],
                'lgaAncCompletion' => [
                    'Kaduna North' => 65,
                    'Kaduna South' => 72,
                    'Chikun' => 58,
                    'Igabi' => 61
                ],
                'ancProgress' => [
                    'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    'actual' => [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
                    'target' => array_fill(0, 12, 25)
                ]
            ];
        }

        return [
            'monthlyRegistrations' => $patients->groupBy(fn($p) => Carbon::parse($p->date_of_registration)->format('Y-m'))->map->count()->toArray(),
            'deliveryOutcomes' => $patients->whereNotNull('delivery_outcome')->groupBy('delivery_outcome')->map->count()->toArray(),
            'lgaAncCompletion' => $patients->groupBy('lga_id')->mapWithKeys(function ($lgaPatients, $lgaId) {
                $lgaName = Lga::find($lgaId)->name ?? 'Unknown';
                $total = $lgaPatients->count();
                $anc4Count = $lgaPatients->where('anc_visits_count', '>=', 4)->count();
                $rate = $total > 0 ? round(($anc4Count / $total) * 100, 1) : 0;
                return [$lgaName => $rate];
            })->toArray(),
            'ancProgress' => [
                'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                'actual' => array_map(fn() => rand(20, 100), range(1, 12)),
                'target' => array_fill(0, 12, 25)
            ]
        ];
    }
}