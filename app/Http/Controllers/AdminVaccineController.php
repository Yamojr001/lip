<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VaccineAccountabilityReport;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminVaccineController extends Controller
{
    /**
     * Display all vaccine reports with filtering
     */
    public function index(Request $request)
    {
        $query = VaccineAccountabilityReport::with(['phc', 'user', 'phc.lga', 'phc.ward'])
            ->select('vaccine_accountability_reports.*')
            ->join('phcs', 'vaccine_accountability_reports.phc_id', '=', 'phcs.id');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('phcs.clinic_name', 'like', "%{$search}%")
                  ->orWhere('month_year', 'like', "%{$search}%")
                  ->orWhereHas('phc.lga', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('phc.ward', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('lga_id')) {
            $query->where('phcs.lga_id', $request->lga_id);
        }

        if ($request->filled('ward_id')) {
            $query->where('phcs.ward_id', $request->ward_id);
        }

        if ($request->filled('phc_id')) {
            $query->where('phc_id', $request->phc_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('reporting_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        if ($request->filled('month_year')) {
            $query->where('month_year', $request->month_year);
        }

        $reports = $query->orderBy('reporting_date', 'desc')
            ->paginate(20)
            ->withQueryString();

        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'name', 'lga_id']);
        $phcs = Phc::all(['id', 'clinic_name', 'ward_id']);

        // Get distinct months for filter
        $months = VaccineAccountabilityReport::select('month_year')
            ->distinct()
            ->orderBy('reporting_date', 'desc')
            ->pluck('month_year');

        return Inertia::render('Admin/Vaccine/Reports', [
            'reports' => $reports,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcs' => $phcs,
            'months' => $months,
            'filters' => $request->only([
                'search', 'lga_id', 'ward_id', 'phc_id', 
                'status', 'start_date', 'end_date', 'month_year'
            ]),
        ]);
    }

    /**
     * Display vaccine statistics with charts
     */
    public function statistics(Request $request)
    {
        // Base query for statistics
        $query = VaccineAccountabilityReport::with(['phc.lga', 'phc.ward'])
            ->select('vaccine_accountability_reports.*')
            ->join('phcs', 'vaccine_accountability_reports.phc_id', '=', 'phcs.id');

        // Apply filters
        if ($request->filled('lga_id')) {
            $query->where('phcs.lga_id', $request->lga_id);
        }

        if ($request->filled('ward_id')) {
            $query->where('phcs.ward_id', $request->ward_id);
        }

        if ($request->filled('phc_id')) {
            $query->where('phc_id', $request->phc_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('reporting_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        if ($request->filled('year')) {
            $query->whereYear('reporting_date', $request->year);
        }

        // Get filtered reports
        $reports = $query->get();

        // Calculate statistics
        $statistics = $this->calculateStatistics($reports);
        
        // Get chart data
        $chartData = $this->getChartData($reports);
        
        // Get facility performance data
        $facilityPerformance = $this->getFacilityPerformance($reports);
        
        // Get monthly trends
        $monthlyTrends = $this->getMonthlyTrends($reports);

        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'name', 'lga_id']);
        $phcs = Phc::all(['id', 'clinic_name', 'ward_id']);

        // Get available years for filter
        $years = VaccineAccountabilityReport::selectRaw('YEAR(reporting_date) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return Inertia::render('Admin/Vaccine/Statistics', [
            'statistics' => $statistics,
            'chartData' => $chartData,
            'facilityPerformance' => $facilityPerformance,
            'monthlyTrends' => $monthlyTrends,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcs' => $phcs,
            'years' => $years,
            'filters' => $request->only([
                'lga_id', 'ward_id', 'phc_id', 
                'start_date', 'end_date', 'year'
            ]),
        ]);
    }

    /**
     * Show individual vaccine report
     */
    public function show($id)
    {
        $report = VaccineAccountabilityReport::with([
            'phc.lga', 
            'phc.ward', 
            'user'
        ])->findOrFail($id);

        return Inertia::render('Admin/Vaccine/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Export vaccine reports
     */
    public function export(Request $request)
    {
        $query = VaccineAccountabilityReport::with(['phc.lga', 'phc.ward'])
            ->select('vaccine_accountability_reports.*')
            ->join('phcs', 'vaccine_accountability_reports.phc_id', '=', 'phcs.id');

        // Apply filters
        if ($request->filled('lga_id')) {
            $query->where('phcs.lga_id', $request->lga_id);
        }

        if ($request->filled('ward_id')) {
            $query->where('phcs.ward_id', $request->ward_id);
        }

        if ($request->filled('phc_id')) {
            $query->where('phc_id', $request->phc_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('reporting_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $reports = $query->orderBy('reporting_date', 'desc')->get();

        return response()->json([
            'message' => 'Export functionality to be implemented',
            'count' => $reports->count(),
            'filters' => $request->all()
        ]);
    }

    /**
     * Calculate comprehensive statistics
     */
    private function calculateStatistics($reports)
    {
        $totalReports = $reports->count();
        $totalDosesUsed = $reports->sum('total_doses_used');
        $totalDosesDiscarded = $reports->sum('total_doses_discarded');
        $totalStockOuts = $reports->sum('stock_out_count');

        // Calculate average wastage rate
        $avgWastageRate = $reports->avg('vaccine_wastage_rate') ?? 0;

        // Count by status
        $statusCounts = $reports->groupBy('status')->map->count();

        // Get reports with high wastage (>10%)
        $highWastageReports = $reports->filter(function ($report) {
            return $report->vaccine_wastage_rate > 10;
        })->count();

        // Get reports with stock outs
        $reportsWithStockOuts = $reports->filter(function ($report) {
            return $report->stock_out_count > 0;
        })->count();

        // Calculate percentage of reports with issues
        $reportsWithIssues = $reports->filter(function ($report) {
            return $report->vaccine_wastage_rate > 10 || $report->stock_out_count > 0;
        })->count();

        $reportsWithIssuesPercentage = $totalReports > 0 
            ? round(($reportsWithIssues / $totalReports) * 100, 1)
            : 0;

        return [
            'total_reports' => $totalReports,
            'total_doses_used' => $totalDosesUsed,
            'total_doses_discarded' => $totalDosesDiscarded,
            'total_stock_outs' => $totalStockOuts,
            'avg_wastage_rate' => round($avgWastageRate, 2),
            'high_wastage_reports' => $highWastageReports,
            'reports_with_stock_outs' => $reportsWithStockOuts,
            'reports_with_issues' => $reportsWithIssues,
            'reports_with_issues_percentage' => $reportsWithIssuesPercentage,
            'status_counts' => $statusCounts,
        ];
    }

    /**
     * Get chart data for visualization
     */
    private function getChartData($reports)
    {
        // Status distribution
        $statusData = $reports->groupBy('status')->map(function ($group) {
            return $group->count();
        })->toArray();

        // Wastage rate distribution
        $wastageRanges = [
            '0-5%' => 0,
            '5-10%' => 0,
            '10-15%' => 0,
            '15-20%' => 0,
            '>20%' => 0,
        ];

        foreach ($reports as $report) {
            $rate = $report->vaccine_wastage_rate;
            if ($rate <= 5) {
                $wastageRanges['0-5%']++;
            } elseif ($rate <= 10) {
                $wastageRanges['5-10%']++;
            } elseif ($rate <= 15) {
                $wastageRanges['10-15%']++;
            } elseif ($rate <= 20) {
                $wastageRanges['15-20%']++;
            } else {
                $wastageRanges['>20%']++;
            }
        }

        // Stock out distribution
        $stockOutRanges = [
            'None' => 0,
            '1-3' => 0,
            '4-6' => 0,
            '7-9' => 0,
            '10+' => 0,
        ];

        foreach ($reports as $report) {
            $count = $report->stock_out_count;
            if ($count === 0) {
                $stockOutRanges['None']++;
            } elseif ($count <= 3) {
                $stockOutRanges['1-3']++;
            } elseif ($count <= 6) {
                $stockOutRanges['4-6']++;
            } elseif ($count <= 9) {
                $stockOutRanges['7-9']++;
            } else {
                $stockOutRanges['10+']++;
            }
        }

        return [
            'status_distribution' => $statusData,
            'wastage_distribution' => $wastageRanges,
            'stock_out_distribution' => $stockOutRanges,
        ];
    }

    /**
     * Get facility performance data
     */
    private function getFacilityPerformance($reports)
    {
        $facilityData = $reports->groupBy('phc_id')->map(function ($group) {
            $phc = $group->first()->phc;
            $totalReports = $group->count();
            $avgWastageRate = $group->avg('vaccine_wastage_rate') ?? 0;
            $totalStockOuts = $group->sum('stock_out_count');
            $totalDosesUsed = $group->sum('total_doses_used');
            $totalDosesDiscarded = $group->sum('total_doses_discarded');
            
            // Calculate compliance rate (reports submitted on time)
            $onTimeReports = $group->filter(function ($report) {
                $reportingDate = Carbon::parse($report->reporting_date);
                $submissionDate = Carbon::parse($report->submission_date ?? $report->created_at);
                return $submissionDate->diffInDays($reportingDate) <= 7;
            })->count();

            $complianceRate = $totalReports > 0 
                ? round(($onTimeReports / $totalReports) * 100, 1)
                : 0;

            return [
                'facility_id' => $phc->id,
                'facility_name' => $phc->clinic_name,
                'lga' => $phc->lga->name ?? 'N/A',
                'ward' => $phc->ward->name ?? 'N/A',
                'total_reports' => $totalReports,
                'avg_wastage_rate' => round($avgWastageRate, 2),
                'total_stock_outs' => $totalStockOuts,
                'total_doses_used' => $totalDosesUsed,
                'total_doses_discarded' => $totalDosesDiscarded,
                'compliance_rate' => $complianceRate,
                'status' => $avgWastageRate > 15 ? 'High Risk' : 
                           ($avgWastageRate > 10 ? 'Medium Risk' : 'Low Risk'),
            ];
        })->values()->sortByDesc('avg_wastage_rate')->take(20);

        return $facilityData;
    }

    /**
     * Get monthly trends data
     */
    private function getMonthlyTrends($reports)
    {
        $monthlyData = $reports->groupBy(function ($report) {
            return Carbon::parse($report->reporting_date)->format('Y-m');
        })->map(function ($group) {
            return [
                'reports' => $group->count(),
                'avg_wastage_rate' => round($group->avg('vaccine_wastage_rate') ?? 0, 2),
                'total_doses_used' => $group->sum('total_doses_used'),
                'total_doses_discarded' => $group->sum('total_doses_discarded'),
                'total_stock_outs' => $group->sum('stock_out_count'),
            ];
        })->sortKeys();

        // Format for chart
        $chartData = [];
        foreach ($monthlyData as $month => $data) {
            $chartData[] = [
                'month' => Carbon::parse($month)->format('M Y'),
                'reports' => $data['reports'],
                'avg_wastage_rate' => $data['avg_wastage_rate'],
                'total_doses_used' => $data['total_doses_used'],
                'total_doses_discarded' => $data['total_doses_discarded'],
            ];
        }

        return $chartData;
    }
}