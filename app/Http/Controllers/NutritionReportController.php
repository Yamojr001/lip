<?php

namespace App\Http\Controllers;

use App\Models\NutritionReport;
use App\Models\Phc;
use App\Models\Lga;
use App\Models\Ward;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Inertia\Inertia;

class NutritionReportController extends Controller
{
    /**
     * Display nutrition reports for PHC staff
     */
    public function index(Request $request)
    {
        $query = NutritionReport::where('phc_id', auth()->user()->phc_id);
        
        // Filter by year if provided
        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }
        
        // Filter by month if provided
        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        $reports = $query->orderBy('year', 'desc')
                        ->orderByRaw("FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')")
                        ->paginate(12);

        return Inertia::render('Phc/Nutrition/Index', [
            'reports' => $reports,
            'years' => NutritionReport::getYears(),
            'months' => NutritionReport::getMonths(),
            'filters' => $request->only(['year', 'month']),
        ]);
    }

    /**
     * Show the form for creating a new nutrition report
     */
    public function create()
    {
        // Check if report already exists for current month
        $currentMonth = Carbon::now()->format('F');
        $currentYear = Carbon::now()->format('Y');
        
        $existingReport = NutritionReport::where('phc_id', auth()->user()->phc_id)
            ->where('year', $currentYear)
            ->where('month', $currentMonth)
            ->first();

        if ($existingReport) {
            return redirect()->route('phc.nutrition.reports.edit', $existingReport->id)
                ->with('info', 'A nutrition report for this month already exists. You can edit it.');
        }

        return Inertia::render('Phc/Nutrition/Create', [
            'years' => NutritionReport::getYears(),
            'months' => NutritionReport::getMonths(),
            'currentYear' => $currentYear,
            'currentMonth' => $currentMonth,
        ]);
    }

    /**
     * Store a newly created nutrition report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'month' => ['required', 'string', Rule::in(NutritionReport::getMonths())],
            
            // Total children screened
            'total_children_screened' => 'required|integer|min:0',
            
            // Age 6-23 months (by gender)
            'age_6_23_male_screened' => 'required|integer|min:0',
            'age_6_23_female_screened' => 'required|integer|min:0',
            
            // Age 24-59 months (by gender)
            'age_24_59_male_screened' => 'required|integer|min:0',
            'age_24_59_female_screened' => 'required|integer|min:0',
            
            // Normal children identified
            'age_6_23_male_normal' => 'required|integer|min:0',
            'age_6_23_female_normal' => 'required|integer|min:0',
            'age_24_59_male_normal' => 'required|integer|min:0',
            'age_24_59_female_normal' => 'required|integer|min:0',
            
            // MAM children identified
            'age_6_23_male_mam' => 'required|integer|min:0',
            'age_6_23_female_mam' => 'required|integer|min:0',
            'age_24_59_male_mam' => 'required|integer|min:0',
            'age_24_59_female_mam' => 'required|integer|min:0',
            
            // SAM children identified
            'age_6_23_male_sam' => 'required|integer|min:0',
            'age_6_23_female_sam' => 'required|integer|min:0',
            'age_24_59_male_sam' => 'required|integer|min:0',
            'age_24_59_female_sam' => 'required|integer|min:0',
            
            // New SAM in this outreach
            'new_sam_this_outreach' => 'required|integer|min:0',
            
            // SAM referred to OTP
            'sam_referred_otp' => 'required|integer|min:0',
            
            // Oedema/SAM with complications referred to SC
            'oedema_sam_complications_male' => 'required|integer|min:0',
            'oedema_sam_complications_female' => 'required|integer|min:0',
            
            // Oedema total by gender
            'oedema_total_male' => 'required|integer|min:0',
            'oedema_total_female' => 'required|integer|min:0',
            
            // SAM with complications referred to SC by gender
            'sam_complications_male_sc' => 'required|integer|min:0',
            'sam_complications_female_sc' => 'required|integer|min:0',
            
            // Albendazole
            'albendazole_12_23_male' => 'required|integer|min:0',
            'albendazole_12_23_female' => 'required|integer|min:0',
            'albendazole_24_59_male' => 'required|integer|min:0',
            'albendazole_24_59_female' => 'required|integer|min:0',
            
            // Vitamin A Supplementation (VAS)
            'vas_6_11_first_dose_male' => 'required|integer|min:0',
            'vas_6_11_first_dose_female' => 'required|integer|min:0',
            'vas_12_59_second_dose_male' => 'required|integer|min:0',
            'vas_12_59_second_dose_female' => 'required|integer|min:0',
            
            // RUTF given
            'rutf_given' => 'required|integer|min:0',
            
            // MNP given
            'mnp_given' => 'required|integer|min:0',
            
            // Exclusive breastfeeding (0-6 months)
            'exclusive_breastfeeding_0_6' => 'required|integer|min:0',
            
            // Pregnant women and caregivers counselled
            'miycf_counselled_pregnant_women' => 'required|integer|min:0',
            'miycf_counselled_caregivers' => 'required|integer|min:0',
            
            'comments' => 'nullable|string|max:1000',
            'submitted' => 'boolean',
        ]);

        // Check if report already exists for this month and year
        $existingReport = NutritionReport::where('phc_id', auth()->user()->phc_id)
            ->where('year', $validated['year'])
            ->where('month', $validated['month'])
            ->first();

        if ($existingReport) {
            return redirect()->back()
                ->with('error', 'A nutrition report already exists for ' . $validated['month'] . ' ' . $validated['year'])
                ->withInput();
        }

        $validated['phc_id'] = auth()->user()->phc_id;
        $validated['user_id'] = auth()->id();
        
        if ($request->input('submitted')) {
            $validated['submitted_at'] = now();
        }

        NutritionReport::create($validated);

        return redirect()->route('phc.nutrition.reports.index')
            ->with('success', 'Nutrition report created successfully!');
    }

    /**
     * Show the form for editing the specified nutrition report
     */
    public function edit(NutritionReport $nutritionReport)
    {
        // Authorization check - ensure PHC staff can only edit their own reports
        if ($nutritionReport->phc_id !== auth()->user()->phc_id) {
            abort(403);
        }

        return Inertia::render('Phc/Nutrition/Edit', [
            'report' => $nutritionReport,
            'years' => NutritionReport::getYears(),
            'months' => NutritionReport::getMonths(),
        ]);
    }

    /**
     * Update the specified nutrition report
     */
    public function update(Request $request, NutritionReport $nutritionReport)
    {
        // Authorization check
        if ($nutritionReport->phc_id !== auth()->user()->phc_id) {
            abort(403);
        }

        $validated = $request->validate([
            'year' => 'required|integer|min:2020|max:' . (date('Y') + 1),
            'month' => ['required', 'string', Rule::in(NutritionReport::getMonths())],
            
            // Total children screened
            'total_children_screened' => 'required|integer|min:0',
            
            // Age 6-23 months (by gender)
            'age_6_23_male_screened' => 'required|integer|min:0',
            'age_6_23_female_screened' => 'required|integer|min:0',
            
            // Age 24-59 months (by gender)
            'age_24_59_male_screened' => 'required|integer|min:0',
            'age_24_59_female_screened' => 'required|integer|min:0',
            
            // Normal children identified
            'age_6_23_male_normal' => 'required|integer|min:0',
            'age_6_23_female_normal' => 'required|integer|min:0',
            'age_24_59_male_normal' => 'required|integer|min:0',
            'age_24_59_female_normal' => 'required|integer|min:0',
            
            // MAM children identified
            'age_6_23_male_mam' => 'required|integer|min:0',
            'age_6_23_female_mam' => 'required|integer|min:0',
            'age_24_59_male_mam' => 'required|integer|min:0',
            'age_24_59_female_mam' => 'required|integer|min:0',
            
            // SAM children identified
            'age_6_23_male_sam' => 'required|integer|min:0',
            'age_6_23_female_sam' => 'required|integer|min:0',
            'age_24_59_male_sam' => 'required|integer|min:0',
            'age_24_59_female_sam' => 'required|integer|min:0',
            
            // New SAM in this outreach
            'new_sam_this_outreach' => 'required|integer|min:0',
            
            // SAM referred to OTP
            'sam_referred_otp' => 'required|integer|min:0',
            
            // Oedema/SAM with complications referred to SC
            'oedema_sam_complications_male' => 'required|integer|min:0',
            'oedema_sam_complications_female' => 'required|integer|min:0',
            
            // Oedema total by gender
            'oedema_total_male' => 'required|integer|min:0',
            'oedema_total_female' => 'required|integer|min:0',
            
            // SAM with complications referred to SC by gender
            'sam_complications_male_sc' => 'required|integer|min:0',
            'sam_complications_female_sc' => 'required|integer|min:0',
            
            // Albendazole
            'albendazole_12_23_male' => 'required|integer|min:0',
            'albendazole_12_23_female' => 'required|integer|min:0',
            'albendazole_24_59_male' => 'required|integer|min:0',
            'albendazole_24_59_female' => 'required|integer|min:0',
            
            // Vitamin A Supplementation (VAS)
            'vas_6_11_first_dose_male' => 'required|integer|min:0',
            'vas_6_11_first_dose_female' => 'required|integer|min:0',
            'vas_12_59_second_dose_male' => 'required|integer|min:0',
            'vas_12_59_second_dose_female' => 'required|integer|min:0',
            
            // RUTF given
            'rutf_given' => 'required|integer|min:0',
            
            // MNP given
            'mnp_given' => 'required|integer|min:0',
            
            // Exclusive breastfeeding (0-6 months)
            'exclusive_breastfeeding_0_6' => 'required|integer|min:0',
            
            // Pregnant women and caregivers counselled
            'miycf_counselled_pregnant_women' => 'required|integer|min:0',
            'miycf_counselled_caregivers' => 'required|integer|min:0',
            
            'comments' => 'nullable|string|max:1000',
            'submitted' => 'boolean',
        ]);

        // Check if another report already exists for this month and year (excluding current)
        $existingReport = NutritionReport::where('phc_id', auth()->user()->phc_id)
            ->where('year', $validated['year'])
            ->where('month', $validated['month'])
            ->where('id', '!=', $nutritionReport->id)
            ->first();

        if ($existingReport) {
            return redirect()->back()
                ->with('error', 'Another nutrition report already exists for ' . $validated['month'] . ' ' . $validated['year'])
                ->withInput();
        }

        if ($request->input('submitted') && !$nutritionReport->submitted) {
            $validated['submitted_at'] = now();
        }

        $nutritionReport->update($validated);

        return redirect()->route('phc.nutrition.reports.index')
            ->with('success', 'Nutrition report updated successfully!');
    }

    /**
     * Submit a nutrition report
     */
    public function submit(NutritionReport $nutritionReport)
    {
        // Authorization check
        if ($nutritionReport->phc_id !== auth()->user()->phc_id) {
            abort(403);
        }

        $nutritionReport->update([
            'submitted' => true,
            'submitted_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Nutrition report submitted successfully!');
    }

    /**
     * Delete a nutrition report
     */
    public function destroy(NutritionReport $nutritionReport)
    {
        // Authorization check
        if ($nutritionReport->phc_id !== auth()->user()->phc_id) {
            abort(403);
        }

        $nutritionReport->delete();

        return redirect()->route('phc.nutrition.reports.index')
            ->with('success', 'Nutrition report deleted successfully!');
    }

    /**
     * Admin: View all nutrition reports with filters
     */
    public function adminIndex(Request $request)
    {
        $query = NutritionReport::with(['phc', 'user', 'phc.ward', 'phc.ward.lga']);

        // Apply filters
        if ($lga_id = $request->input('lga_id')) {
            $query->whereHas('phc.ward', function ($q) use ($lga_id) {
                $q->where('lga_id', $lga_id);
            });
        }

        if ($ward_id = $request->input('ward_id')) {
            $query->whereHas('phc', function ($q) use ($ward_id) {
                $q->where('ward_id', $ward_id);
            });
        }

        if ($phc_id = $request->input('phc_id')) {
            $query->where('phc_id', $phc_id);
        }

        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        if ($start_date = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $end_date);
        }

        $reports = $query->orderBy('year', 'desc')
                        ->orderByRaw("FIELD(month, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')")
                        ->paginate(20);

        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'lga_id', 'name']);
        $phcs = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Admin/Nutrition/Index', [
            'reports' => $reports,
            'years' => NutritionReport::getYears(),
            'months' => NutritionReport::getMonths(),
            'lgas' => $lgas,
            'wards' => $wards,
            'phcs' => $phcs,
            'filters' => $request->only(['lga_id', 'ward_id', 'phc_id', 'year', 'month', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Admin: View nutrition statistics
     */
    public function adminStatistics(Request $request)
    {
        $query = NutritionReport::with(['phc', 'phc.ward', 'phc.ward.lga']);

        // Apply filters
        if ($lga_id = $request->input('lga_id')) {
            $query->whereHas('phc.ward', function ($q) use ($lga_id) {
                $q->where('lga_id', $lga_id);
            });
        }

        if ($ward_id = $request->input('ward_id')) {
            $query->whereHas('phc', function ($q) use ($ward_id) {
                $q->where('ward_id', $ward_id);
            });
        }

        if ($phc_id = $request->input('phc_id')) {
            $query->where('phc_id', $phc_id);
        }

        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        if ($start_date = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $end_date);
        }

        $reports = $query->get();

        // Calculate statistics
        $statistics = [
            'total_reports' => $reports->count(),
            'total_children_screened' => $reports->sum('total_children_screened'),
            'total_normal' => $reports->sum(fn($r) => $r->total_normal),
            'total_mam' => $reports->sum(fn($r) => $r->total_mam),
            'total_sam' => $reports->sum(fn($r) => $r->total_sam),
            'total_oedema' => $reports->sum(fn($r) => $r->total_oedema),
            'total_albendazole' => $reports->sum(fn($r) => $r->total_albendazole),
            'total_vas' => $reports->sum(fn($r) => $r->total_vas),
            'total_rutf_given' => $reports->sum('rutf_given'),
            'total_mnp_given' => $reports->sum('mnp_given'),
            'total_exclusive_breastfeeding' => $reports->sum('exclusive_breastfeeding_0_6'),
            'total_miycf_counselled' => $reports->sum(fn($r) => $r->total_miycf_counselled),
        ];

        // Monthly trends
        $monthlyData = $reports->groupBy(['year', 'month'])->map(function ($yearGroup) {
            return $yearGroup->map(function ($monthGroup) {
                return [
                    'total_screened' => $monthGroup->sum('total_children_screened'),
                    'total_sam' => $monthGroup->sum(fn($r) => $r->total_sam),
                    'total_mam' => $monthGroup->sum(fn($r) => $r->total_mam),
                    'total_rutf' => $monthGroup->sum('rutf_given'),
                ];
            });
        });

        // Facility performance
        $facilityPerformance = $reports->groupBy('phc_id')->map(function ($phcReports, $phcId) {
            $phc = $phcReports->first()->phc;
            return [
                'facility_name' => $phc->clinic_name,
                'total_reports' => $phcReports->count(),
                'total_screened' => $phcReports->sum('total_children_screened'),
                'avg_sam_rate' => $phcReports->avg(fn($r) => $r->total_sam),
                'avg_mam_rate' => $phcReports->avg(fn($r) => $r->total_mam),
                'total_rutf' => $phcReports->sum('rutf_given'),
            ];
        })->values();

        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'lga_id', 'name']);
        $phcs = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Admin/Nutrition/Statistics', [
            'statistics' => $statistics,
            'monthlyData' => $monthlyData,
            'facilityPerformance' => $facilityPerformance,
            'years' => NutritionReport::getYears(),
            'months' => NutritionReport::getMonths(),
            'lgas' => $lgas,
            'wards' => $wards,
            'phcs' => $phcs,
            'filters' => $request->only(['lga_id', 'ward_id', 'phc_id', 'year', 'month', 'start_date', 'end_date']),
        ]);
    }

    /**
     * Export nutrition reports
     */
    public function export(Request $request)
    {
        $query = NutritionReport::with(['phc', 'phc.ward', 'phc.ward.lga']);

        // Apply filters
        if ($lga_id = $request->input('lga_id')) {
            $query->whereHas('phc.ward', function ($q) use ($lga_id) {
                $q->where('lga_id', $lga_id);
            });
        }

        if ($ward_id = $request->input('ward_id')) {
            $query->whereHas('phc', function ($q) use ($ward_id) {
                $q->where('ward_id', $ward_id);
            });
        }

        if ($phc_id = $request->input('phc_id')) {
            $query->where('phc_id', $phc_id);
        }

        if ($year = $request->input('year')) {
            $query->where('year', $year);
        }

        if ($month = $request->input('month')) {
            $query->where('month', $month);
        }

        if ($start_date = $request->input('start_date')) {
            $query->whereDate('created_at', '>=', $start_date);
        }

        if ($end_date = $request->input('end_date')) {
            $query->whereDate('created_at', '<=', $end_date);
        }

        $reports = $query->get();

        // For now, return JSON. You can implement CSV/Excel export later
        return response()->json([
            'data' => $reports,
            'total' => $reports->count(),
            'filters' => $request->all(),
        ]);
    }
}