<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display all patients for this PHC.
     */
    public function index(Request $request)
    {
        $query = Patient::query()->where('phc_id', auth()->user()->phc_id);

        // Search filter - fixed to include phone_number
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('community', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $patients = $query->latest()->paginate(10);
        $lgas = Lga::all();
        $wards = Ward::all();

        return Inertia::render('Phc/Dashboard', [
            'patients' => $patients,
            'lgas' => $lgas,
            'wards' => $wards,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a new patient record.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            // Personal Information
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Not Literate',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'lga' => 'required|string|max:255',
            'ward' => 'required|string|max:255',

            // Medical Info
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',

            // ANC Visits
            'anc_visit_1' => 'nullable|date',
            'anc_visit_2' => 'nullable|date',
            'anc_visit_3' => 'nullable|date',
            'anc_visit_4' => 'nullable|date',
            'additional_anc' => 'nullable|string',
            'tracked_before_anc1' => 'boolean',
            'tracked_before_anc2' => 'boolean',
            'tracked_before_anc3' => 'boolean',
            'tracked_before_anc4' => 'boolean',

            // Delivery
            'place_of_delivery' => 'nullable|in:PHC,Secondary,Tertiary,Home,TBA',
            'received_delivery_kits' => 'boolean',
            'type_of_delivery' => 'nullable|in:Vaginal,Assisted,Cesarean,Breech',
            'delivery_outcome' => 'nullable|in:Live birth,Stillbirth,Referral,Complication',
            'date_of_delivery' => 'nullable|date',

            // Postnatal
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',

            // Additional
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        // Generate unique ID (e.g. KAD/RIG/001)
        $lga_code = strtoupper(substr($data['lga'], 0, 3));
        $ward_code = strtoupper(substr($data['ward'], 0, 3));
        $serial = str_pad(
            Patient::where('lga', $data['lga'])->where('ward', $data['ward'])->count() + 1,
            3,
            '0',
            STR_PAD_LEFT
        );
        $data['unique_id'] = "{$lga_code}/{$ward_code}/{$serial}";
        $data['phc_id'] = auth()->user()->phc_id;

        // Convert boolean fields
        $booleanFields = ['tracked_before_anc1', 'tracked_before_anc2', 'tracked_before_anc3', 'tracked_before_anc4', 'received_delivery_kits'];
        foreach ($booleanFields as $field) {
            $data[$field] = isset($data[$field]) ? (bool)$data[$field] : false;
        }

        // Save patient
        Patient::create($data);

        return back()->with('success', 'Patient registered successfully!');
    }

    /**
     * View a single patient record.
     */
    public function show($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        return Inertia::render('Phc/ViewPatient', ['patient' => $patient]);
    }

    /**
     * Update patient record.
     */
    public function update(Request $request, $id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);

        $data = $request->validate([
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Not Literate',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        $patient->update($data);

        return back()->with('success', 'Patient updated successfully!');
    }

    /**
     * Delete a patient record.
     */
    public function destroy($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        $patient->delete();

        return back()->with('success', 'Patient record deleted successfully!');
    }
}