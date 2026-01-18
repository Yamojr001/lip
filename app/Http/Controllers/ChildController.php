<?php

namespace App\Http\Controllers;

use App\Models\Child;
use App\Models\ChildNutritionLog;
use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ChildController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $phcId = $user->phc_id;
        
        if (!$phcId) {
            return Inertia::render('Phc/Children/Index', [
                'children' => [],
                'error' => 'Your account is not associated with any PHC facility.'
            ]);
        }

        $query = Child::query()->where('phc_id', $phcId)->with(['patient', 'lga', 'ward', 'phc']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('child_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('mother_name', 'like', "%{$search}%")
                    ->orWhere('mother_phone', 'like', "%{$search}%");
            });
        }

        $children = $query->latest()->paginate(20);

        return Inertia::render('Phc/Children/Index', [
            'children' => $children,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->phc_id) {
            return redirect()->route('phc.dashboard')
                ->with('error', 'Your account is not associated with any PHC facility.');
        }

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);
        
        $patient = null;
        if ($patientId = $request->input('patient_id')) {
            $patient = Patient::find($patientId);
        }

        return Inertia::render('Phc/Children/Create', [
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'patient' => $patient,
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->phc_id) {
            return redirect()->back()
                ->with('error', 'Your account is not associated with any PHC facility.');
        }

        $validated = $request->validate([
            'patient_id' => 'nullable|exists:patients,id',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'child_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before_or_equal:today',
            'sex' => 'required|in:Male,Female',
            'birth_weight' => 'nullable|numeric|min:0.5|max:10',
            'place_of_birth' => 'nullable|string|max:255',
            'mother_name' => 'required|string|max:255',
            'mother_phone' => 'required|string|max:20',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'community' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated, $user, $request) {
            $lga = Lga::find($validated['lga_id']);
            $ward = Ward::find($validated['ward_id']);
            
            $lga_code = strtoupper(substr($lga->code ?? $lga->name, 0, 3));
            $ward_code = strtoupper(substr($ward->code ?? $ward->name, 0, 3));
            
            $serial = str_pad(
                Child::where('lga_id', $validated['lga_id'])->where('ward_id', $validated['ward_id'])->count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );
            
            $validated['unique_id'] = "CH/{$lga_code}/{$ward_code}/{$serial}";
            $validated['phc_id'] = $user->phc_id;

            $child = Child::create($validated);

            if ($request->input('patient_id')) {
                return redirect()->route('phc.patient.dashboard', $request->input('patient_id'))
                    ->with('success', 'Child registered successfully! ID: ' . $validated['unique_id']);
            }

            return redirect()->route('phc.children.index')
                ->with('success', 'Child registered successfully! ID: ' . $validated['unique_id']);
        });
    }

    public function show(Child $child)
    {
        $child->load(['patient', 'lga', 'ward', 'phc', 'nutritionLogs' => function ($q) {
            $q->latest('visit_date')->limit(10);
        }]);

        return Inertia::render('Phc/Children/Show', [
            'child' => $child,
        ]);
    }

    public function edit(Child $child)
    {
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/Children/Edit', [
            'child' => $child,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
    }

    public function update(Request $request, Child $child)
    {
        $validated = $request->validate([
            'child_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date|before_or_equal:today',
            'sex' => 'required|in:Male,Female',
            'birth_weight' => 'nullable|numeric|min:0.5|max:10',
            'place_of_birth' => 'nullable|string|max:255',
            'mother_name' => 'required|string|max:255',
            'mother_phone' => 'required|string|max:20',
            'father_name' => 'nullable|string|max:255',
            'father_phone' => 'nullable|string|max:20',
            'address' => 'required|string',
            'community' => 'nullable|string|max:255',
        ]);

        $child->update($validated);

        return redirect()->route('phc.children.show', $child)
            ->with('success', 'Child information updated successfully!');
    }

    public function addImmunization(Request $request, Child $child)
    {
        $validated = $request->validate([
            'vaccine' => 'required|string',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $vaccineField = strtolower($validated['vaccine']) . '_received';
        $dateField = strtolower($validated['vaccine']) . '_date';

        if (!in_array($vaccineField, $child->getFillable())) {
            return redirect()->back()->with('error', 'Invalid vaccine type.');
        }

        $child->update([
            $vaccineField => true,
            $dateField => $validated['date'],
        ]);

        return redirect()->back()->with('success', 'Immunization recorded successfully!');
    }

    public function addNutritionLog(Request $request, Child $child)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'visit_date' => 'required|date|before_or_equal:today',
            'weight' => 'required|numeric|min:0.5|max:50',
            'height' => 'nullable|numeric|min:30|max:200',
            'muac' => 'nullable|numeric|min:5|max:30',
            'vitamin_a_given' => 'boolean',
            'deworming_given' => 'boolean',
            'iron_supplement_given' => 'boolean',
            'feeding_practice' => 'nullable|in:Exclusive Breastfeeding,Mixed Feeding,Formula Only,Complementary Feeding',
            'referred_for_treatment' => 'boolean',
            'referral_reason' => 'nullable|string|max:255',
            'counseling_given' => 'nullable|string',
            'remarks' => 'nullable|string',
            'next_visit_date' => 'nullable|date|after:today',
        ]);

        $validated['child_id'] = $child->id;
        $validated['phc_id'] = $user->phc_id;
        $validated['recorded_by'] = $user->id;
        $validated['age_in_months'] = Carbon::parse($child->date_of_birth)->diffInMonths(Carbon::parse($validated['visit_date']));

        if (isset($validated['muac'])) {
            $validated['muac_status'] = ChildNutritionLog::calculateMuacStatus($validated['muac']);
        }

        ChildNutritionLog::create($validated);
        
        $child->touch();

        return redirect()->back()->with('success', 'Nutrition log added successfully!');
    }

    public function nutritionLogs(Child $child)
    {
        $logs = $child->nutritionLogs()->with('recordedBy')->latest('visit_date')->paginate(20);

        return Inertia::render('Phc/Children/NutritionLogs', [
            'child' => $child,
            'logs' => $logs,
        ]);
    }
}
