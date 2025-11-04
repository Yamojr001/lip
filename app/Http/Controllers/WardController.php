<?php

namespace App\Http\Controllers;

use App\Models\Ward;
use Illuminate\Http\Request;

class WardController extends Controller
{
    /**
     * Store a newly created Ward in storage.
     * Handles the POST request to admin.wards.store.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Must reference an existing LGA
            'lga_id' => 'required|exists:lgas,id', 
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:3',
        ]);

        // Optional: Check for unique combination of name/lga_id
        if (Ward::where('name', $validated['name'])->where('lga_id', $validated['lga_id'])->exists()) {
            return back()->withErrors(['name' => 'This ward name already exists for this LGA.']);
        }
        
        // Optional: Check for unique code/lga_id combination
        if (Ward::where('code', $validated['code'])->where('lga_id', $validated['lga_id'])->exists()) {
            return back()->withErrors(['code' => 'This ward code already exists for this LGA.']);
        }


        Ward::create($validated);

        // Redirect back to the index page to show the new list
        return redirect()->route('admin.manage-locations')->with('success', 'Ward added successfully.');
    }
}