<?php

namespace App\Http\Controllers;

use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PhcController extends Controller
{
    /**
     * Display the Manage Facilities page (for admin).
     * This method renders the Admin/ManageFacilities.jsx component.
     */
    public function adminIndex()
    {
        // Fetch necessary data for the form and the existing table
        $lgas = Lga::all(['id', 'name']);
        $allWards = Ward::all(['id', 'lga_id', 'name']);
        
        // Fetch PHCs with their related LGA and Ward names for the table
        $phcs = Phc::with(['lga:id,name', 'ward:id,name'])->get();

        // Renders the component 'resources/js/Pages/Admin/ManageFacilities.jsx'
        return Inertia::render('Admin/ManageFacilities', [
            'lgas' => $lgas,
            'allWards' => $allWards,
            'phcs' => $phcs,
        ]);
    }

    /**
     * Display PHCs for public viewing
     */
    public function publicIndex()
    {
        $phcs = Phc::with(['lga', 'ward'])
            ->orderBy('clinic_name')
            ->get()
            ->map(function ($phc) {
                return [
                    'id' => $phc->id,
                    'clinic_name' => $phc->clinic_name,
                    'address' => $phc->address,
                    'email' => $phc->email,
                    'contact_phone' => $phc->contact_phone,
                    'incharge_name' => $phc->incharge_name,
                    'anc_schedule' => $phc->anc_schedule,
                    'images' => $phc->images,
                    'lga' => $phc->lga ? $phc->lga->name : null,
                    'ward' => $phc->ward ? $phc->ward->name : null,
                    'created_at' => $phc->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('ViewPhcs', [
            'phcs' => $phcs,
            'appName' => config('app.name', 'Lafiyar Iyali')
        ]);
    }

    /**
     * Display a single PHC for public viewing
     */
    public function publicShow(Phc $phc)
    {
        $phc->load(['lga', 'ward']);
        
        $phcData = [
            'id' => $phc->id,
            'clinic_name' => $phc->clinic_name,
            'address' => $phc->address,
            'email' => $phc->email,
            'contact_phone' => $phc->contact_phone,
            'incharge_name' => $phc->incharge_name,
            'anc_schedule' => $phc->anc_schedule,
            'images' => $phc->images,
            'lga' => $phc->lga ? $phc->lga->name : null,
            'ward' => $phc->ward ? $phc->ward->name : null,
            'created_at' => $phc->created_at->format('M d, Y'),
        ];

        return Inertia::render('PhcDetail', [
            'phc' => $phcData,
            'appName' => config('app.name', 'Lafiyar Iyali')
        ]);
    }

    /**
     * Display PHCs listing (alias for publicIndex for backward compatibility)
     */
    public function index()
    {
        return $this->publicIndex();
    }

    /**
     * Display the specified PHC (alias for publicShow for backward compatibility)
     */
    public function show(Phc $phc)
    {
        return $this->publicShow($phc);
    }

   /**
 * Store a newly created PHC in storage (for admin).
 */
public function store(Request $request)
{
    $validated = $request->validate([
        // Facility Info
        'clinic_name' => 'required|string|max:255|unique:phcs,clinic_name',
        'lga_id' => 'required|exists:lgas,id',
        'ward_id' => [
            'required',
            'exists:wards,id',
            Rule::exists('wards', 'id')->where(function ($query) use ($request) {
                return $query->where('lga_id', $request->lga_id);
            }),
        ],
        'address' => 'required|string|max:255',
        'email' => 'nullable|email|max:255',
        'contact_phone' => 'required|string|max:15',
        'incharge_name' => 'required|string|max:255',

        // ANC Working Days (array validation)
        'anc_working_days' => 'required|array|min:1',
        'anc_working_days.*.day' => 'required|string|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
        'anc_working_days.*.time_from' => 'required|date_format:H:i',
        'anc_working_days.*.time_to' => 'required|date_format:H:i|after:anc_working_days.*.time_from',

        // Images Validation
        'images' => 'required|array|min:1', 
        'images.*' => 'image|max:2048', 

        // Auth Info for new User (In-Charge)
        'user_name' => 'required|string|max:255|unique:users,name',
        'password' => 'required|string|min:8',
    ]);
    
    // File Handling
    $imagePaths = [];
    if ($request->hasFile('images')) {
        foreach ($request->file('images') as $image) {
            // Store the file in 'public/phc_images' disk 
            $path = $image->store('phc_images', 'public'); 
            $imagePaths[] = Storage::url($path); 
        }
    }

    try {
        // Database Transaction
        DB::beginTransaction();

        // 1. Create the PHC facility
        $phc = Phc::create([
            'clinic_name' => $validated['clinic_name'],
            'lga_id' => $validated['lga_id'],
            'ward_id' => $validated['ward_id'],
            'address' => $validated['address'],
            'email' => $validated['email'],
            'contact_phone' => $validated['contact_phone'],
            'incharge_name' => $validated['incharge_name'],
            // Eloquent casting handles the array to JSON conversion
            'anc_schedule' => $validated['anc_working_days'], 
            'images' => $imagePaths, 
        ]);

        // 2. Create the In-Charge User account
        $user = User::create([
            'name' => $validated['user_name'],
            'email' => $validated['email'] ?? $validated['user_name'] . '@phc.com', // Ensure email is set
            'password' => Hash::make($validated['password']),
            'role' => 'phc_staff',
            'phc_id' => $phc->id, 
        ]);

        // Log for debugging
        \Log::info('PHC created with ID: ' . $phc->id);
        \Log::info('User created with PHC ID: ' . $user->phc_id);

        DB::commit();

        return redirect()->route('admin.manage-facilities')->with('success', 'PHC and In-Charge account created successfully.');
        
    } catch (\Exception $e) {
        DB::rollBack();
        
        \Log::error('Error creating PHC and user: ' . $e->getMessage());
        
        // Delete any uploaded images if transaction fails
        foreach ($imagePaths as $path) {
            $fullPath = str_replace('/storage/', 'public/', $path);
            Storage::delete($fullPath);
        }

        return redirect()->back()->with('error', 'Failed to create PHC: ' . $e->getMessage())->withInput();
    }
}
}