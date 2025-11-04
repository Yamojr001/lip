<?php

namespace App\Http\Controllers;

use App\Models\Lga;
use App\Models\Ward;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LgaController extends Controller
{
    /**
     * Display a listing of the LGAs and Wards (for the Admin/ManageLocations page).
     * This method passes data to the view.
     */
    public function index()
    {
        // Fetch all LGAs (required for both LGA form table and Ward form dropdown)
        $lgas = Lga::orderBy('name')->get(['id', 'name', 'code']);

        // Fetch all Wards (required for the Wards table)
        // Note: The N+1 problem is avoided by eager loading the 'lga' relationship 
        $wards = Ward::with('lga:id,name') 
                     ->orderBy('name')
                     ->get(['id', 'lga_id', 'name', 'code']);

        // Renders the component 'resources/js/Pages/Admin/ManageLocations.jsx'
        return Inertia::render('Admin/ManageLocations', [ 
            'lgas' => $lgas,
            'wards' => $wards,
        ]);
    }

    /**
     * Store a newly created LGA in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:lgas,name',
            'code' => 'required|string|max:3|unique:lgas,code',
        ]);

        Lga::create($validated);

        // Redirect back to the index page to show the new list
        return redirect()->route('admin.manage-locations')->with('success', 'LGA added successfully.');
    }
}