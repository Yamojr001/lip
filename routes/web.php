<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PhcController;
use App\Http\Controllers\PhcStaffController;
use App\Http\Controllers\LgaController;
use App\Http\Controllers\WardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\NutritionReportController;

// 🏠 Landing Page
Route::get('/', function () {
    return Inertia::render('Landing', [
        'appName' => config('app.name', 'Lafiyar Iyali Project'),
    ]);
});

Route::get('/terms-of-use', function () {
    return Inertia::render('TermsOfUse', [
        'appName' => config('app.name', 'Lafiyar Iyali Project'),
    ]);
})->name('terms.of.use');

Route::get('/view-phcs', function () {
    return Inertia::render('ViewPhcs', [
        'appName' => config('app.name', 'Lafiyar Iyali Project'),
    ]);
})->name('view.phcs');

// 👩‍⚕️ PHC STAFF ROUTES
Route::middleware(['auth', 'verified', 'role:phc_staff'])
    ->prefix('phc')
    ->name('phc.')
    ->group(function () {
        
        // Dashboard Route
        Route::get('/dashboard', [PhcStaffController::class, 'index'])->name('dashboard');
        
        // Records - Own facility patients
        Route::get('/records', [PhcStaffController::class, 'records'])->name('records');

        // Create new patient
        Route::get('/create-patient', [PhcStaffController::class, 'create'])->name('create-patient');
        
        // Reports
        Route::get('/reports', function () {
            return Inertia::render('Phc/PhcReports'); 
        })->name('reports');

        // Statistics
        Route::get('/statistics', [PhcStaffController::class, 'statistics'])->name('statistics');
        
        // 🔄 NEW: All Patients Search & Cross-Facility Management
        Route::get('/all-patients', [PhcStaffController::class, 'allPatients'])->name('all-patients');
        Route::get('/all-patients/{id}', [PhcStaffController::class, 'showAllPatient'])->name('all-patients.show');
        Route::get('/all-patients/{id}/edit', [PhcStaffController::class, 'editAnyPatient'])->name('all-patients.edit');
        Route::patch('/all-patients/{id}', [PhcStaffController::class, 'updateAnyPatient'])->name('all-patients.update');
        
        // Patient CRUD Routes (Own Facility Only)
        Route::post('/patient', [PhcStaffController::class, 'store'])->name('patient.store');
        Route::get('/patients/{id}', [PhcStaffController::class, 'show'])->name('patients.show');
        Route::get('/patients/{id}/edit', [PhcStaffController::class, 'edit'])->name('patients.edit');
        Route::patch('/patients/{id}', [PhcStaffController::class, 'update'])->name('patients.update');
        Route::delete('/patients/{id}', [PhcStaffController::class, 'destroy'])->name('patients.destroy');

        // Report Generation
        Route::post('/reports/generate', [PhcStaffController::class, 'generateReport'])->name('reports.generate');
        
        // 🍎 NUTRITION REPORT ROUTES
        Route::get('/nutrition-reports', [NutritionReportController::class, 'index'])->name('nutrition.reports.index');
        Route::get('/nutrition-reports/create', [NutritionReportController::class, 'create'])->name('nutrition.reports.create');
        Route::post('/nutrition-reports', [NutritionReportController::class, 'store'])->name('nutrition.reports.store');
        Route::get('/nutrition-reports/{nutritionReport}/edit', [NutritionReportController::class, 'edit'])->name('nutrition.reports.edit');
        Route::put('/nutrition-reports/{nutritionReport}', [NutritionReportController::class, 'update'])->name('nutrition.reports.update');
        Route::delete('/nutrition-reports/{nutritionReport}', [NutritionReportController::class, 'destroy'])->name('nutrition.reports.destroy');
        Route::post('/nutrition-reports/{nutritionReport}/submit', [NutritionReportController::class, 'submit'])->name('nutrition.reports.submit');
    });

// 🧑‍💼 ADMIN ROUTES
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
    
    // Dashboard with all tabs data
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
    
    // Individual tab routes for better data loading
    Route::get('/dashboard/anc', [AdminController::class, 'ancAnalytics'])->name('dashboard.anc');
    Route::get('/dashboard/delivery', [AdminController::class, 'deliveryAnalytics'])->name('dashboard.delivery');
    Route::get('/dashboard/immunization', [AdminController::class, 'immunizationAnalytics'])->name('dashboard.immunization');
    Route::get('/dashboard/fp', [AdminController::class, 'familyPlanningAnalytics'])->name('dashboard.fp');
    Route::get('/dashboard/hiv', [AdminController::class, 'hivAnalytics'])->name('dashboard.hiv');
    Route::get('/dashboard/facilities', [AdminController::class, 'facilitiesAnalytics'])->name('dashboard.facilities');

    Route::post('/create-phc', [AdminController::class, 'createPhc'])->name('createPhc');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');

    // Patient Management Routes
    Route::get('/patients', [AdminController::class, 'allPatients'])->name('patients.index');
    Route::get('/patients/{id}', [AdminController::class, 'showPatient'])->name('patients.show');
    Route::get('/patients/{id}/edit', [AdminController::class, 'editPatient'])->name('patients.edit');
    Route::patch('/patients/{id}', [AdminController::class, 'updatePatient'])->name('patients.update');
    Route::delete('/patients/{id}', [AdminController::class, 'destroyPatient'])->name('patients.destroy');
    Route::get('/patients/export', [AdminController::class, 'exportPatients'])->name('patients.export');

    // LOCATIONS ROUTES
    Route::get('/manage-locations', [LgaController::class, 'index'])->name('manage-locations');
    Route::post('/lgas', [LgaController::class, 'store'])->name('lgas.store');
    Route::post('/wards', [WardController::class, 'store'])->name('wards.store');

    // FACILITIES ROUTES
    Route::get('/manage-facilities', [PhcController::class, 'adminIndex'])->name('manage-facilities');
    Route::post('/phcs', [PhcController::class, 'store'])->name('phcs.store');

    // 🍎 ADMIN NUTRITION REPORT ROUTES
    Route::get('/nutrition-reports', [NutritionReportController::class, 'adminIndex'])->name('nutrition.reports.index');
    Route::get('/nutrition-statistics', [NutritionReportController::class, 'adminStatistics'])->name('nutrition.statistics');
    Route::get('/nutrition-export', [NutritionReportController::class, 'export'])->name('nutrition.export');

    // STATISTICS ROUTE
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');

    // Other Admin Pages
    Route::get('/records', function () {
        return Inertia::render('Admin/AllPatients');
    })->name('records');

    Route::get('/manage-data', function () {
        return Inertia::render('Admin/ManageData');
    })->name('manage-data');
});

// 🎯 Redirect users to their dashboards based on role
Route::get('/dashboard', function () {
    $user = auth()->user();

    if (!$user) {
        return redirect()->route('login');
    }

    return match ($user->role) {
        'admin' => redirect()->route('admin.dashboard'),
        'phc_staff' => redirect()->route('phc.dashboard'),
        default => redirect()->route('login'),
    };
})->middleware(['auth', 'verified'])->name('dashboard');

// 👤 PROFILE ROUTES
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';