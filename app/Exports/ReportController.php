<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Exports\MaternityReportExport;
use App\Models\Patient;
use App\Models\Phc;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only(['start_date', 'end_date', 'report_type', 'status']);
        
        $reports = [];
        $summary = [];
        $charts = [];

        if ($request->hasAny(['start_date', 'end_date', 'report_type'])) {
            $reports = $this->generateReport($filters);
            $summary = $this->generateSummary($filters);
            $charts = $this->generateCharts($filters);
        }

        return inertia('Admin/Reports', [
            'reports' => $reports,
            'summary' => $summary,
            'charts' => $charts,
            'filters' => $filters
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'report_type' => 'required|string',
            'status' => 'nullable|string'
        ]);

        $reportData = $this->generateReport($filters);
        $summary = $this->generateSummary($filters);
        
        $fileName = 'maternity_report_' . now()->format('Y_m_d') . '.csv';

        return Excel::download(
            new MaternityReportExport($filters['report_type'], $reportData, $summary, [], $filters), 
            $fileName,
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    private function generateReport($filters)
    {
        $query = Patient::with(['phc', 'lga', 'ward']);

        if (isset($filters['start_date'])) {
            $query->whereDate('date_of_registration', '>=', $filters['start_date']);
        }
        if (isset($filters['end_date'])) {
            $query->whereDate('date_of_registration', '<=', $filters['end_date']);
        }
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            // You can implement status-based filtering based on your business logic
        }

        return $query->get()->toArray();
    }

    private function generateSummary($filters)
    {
        $query = Patient::query();

        if (isset($filters['start_date'])) {
            $query->whereDate('date_of_registration', '>=', $filters['start_date']);
        }
        if (isset($filters['end_date'])) {
            $query->whereDate('date_of_registration', '<=', $filters['end_date']);
        }

        $totalPatients = $query->count();
        $anc4Completed = $query->where('anc4_completed', true)->count();
        $pncCompleted = $query->where('pnc_completed', true)->count();
        $liveBirths = $query->where('delivery_outcome', 'Live birth')->count();
        $stillbirths = $query->where('delivery_outcome', 'Stillbirth')->count();

        return [
            'total_patients' => $totalPatients,
            'anc4_completed' => $anc4Completed,
            'anc4_completion_rate' => $totalPatients > 0 ? round(($anc4Completed / $totalPatients) * 100, 2) : 0,
            'pnc_completed' => $pncCompleted,
            'pnc_completion_rate' => $totalPatients > 0 ? round(($pncCompleted / $totalPatients) * 100, 2) : 0,
            'live_births' => $liveBirths,
            'stillbirths' => $stillbirths,
        ];
    }

    private function generateCharts($filters)
    {
        $query = Patient::query();

        if (isset($filters['start_date'])) {
            $query->whereDate('date_of_registration', '>=', $filters['start_date']);
        }
        if (isset($filters['end_date'])) {
            $query->whereDate('date_of_registration', '<=', $filters['end_date']);
        }

        // Literacy Status
        $literacyStatus = $query->clone()
            ->select('literacy_status', DB::raw('count(*) as count'))
            ->groupBy('literacy_status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->literacy_status,
                    'value' => $item->count
                ];
            });

        // ANC Completion
        $ancCompletion = [
            ['name' => 'ANC4 Completed', 'value' => $query->clone()->where('anc4_completed', true)->count()],
            ['name' => 'ANC Incomplete', 'value' => $query->clone()->where('anc4_completed', false)->count()]
        ];

        // Delivery Outcomes
        $deliveryOutcomes = $query->clone()
            ->whereNotNull('delivery_outcome')
            ->select('delivery_outcome', DB::raw('count(*) as count'))
            ->groupBy('delivery_outcome')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->delivery_outcome,
                    'value' => $item->count
                ];
            });

        // Monthly Registrations
        $monthlyRegistrations = $query->clone()
            ->select(DB::raw('DATE_FORMAT(date_of_registration, "%Y-%m") as month'), DB::raw('count(*) as registrations'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => $item->month,
                    'registrations' => $item->registrations
                ];
            });

        // Age Distribution
        $ageDistribution = $query->clone()
            ->select(DB::raw('
                CASE 
                    WHEN age < 20 THEN "Under 20"
                    WHEN age BETWEEN 20 AND 24 THEN "20-24"
                    WHEN age BETWEEN 25 AND 29 THEN "25-29"
                    WHEN age BETWEEN 30 AND 34 THEN "30-34"
                    ELSE "35+"
                END as age_group'),
                DB::raw('count(*) as count')
            )
            ->groupBy('age_group')
            ->get()
            ->map(function ($item) {
                return [
                    'age_group' => $item->age_group,
                    'count' => $item->count
                ];
            });

        // Insurance Status
        $insuranceStatus = $query->clone()
            ->whereNotNull('health_insurance_status')
            ->select('health_insurance_status', DB::raw('count(*) as count'))
            ->groupBy('health_insurance_status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->health_insurance_status,
                    'value' => $item->count
                ];
            });

        // Delivery Kits
        $deliveryKits = [
            ['name' => 'Received Kit', 'value' => $query->clone()->where('delivery_kits_received', true)->count()],
            ['name' => 'No Kit', 'value' => $query->clone()->where('delivery_kits_received', false)->count()]
        ];

        // Gravida Distribution
        $gravidaDistribution = $query->clone()
            ->select('gravida', DB::raw('count(*) as count'))
            ->whereNotNull('gravida')
            ->groupBy('gravida')
            ->orderBy('gravida')
            ->get()
            ->map(function ($item) {
                return [
                    'gravida' => "Gravida " . $item->gravida,
                    'count' => $item->count
                ];
            });

        return [
            'literacy_status' => $literacyStatus,
            'anc_completion' => $ancCompletion,
            'delivery_outcomes' => $deliveryOutcomes,
            'monthly_registrations' => $monthlyRegistrations,
            'age_distribution' => $ageDistribution,
            'insurance_status' => $insuranceStatus,
            'delivery_kits' => $deliveryKits,
            'gravida_distribution' => $gravidaDistribution,
        ];
    }
}