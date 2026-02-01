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
use App\Http\Controllers\Admin\AdminVaccineController;
use App\Http\Controllers\ChildController;

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
Route::middleware(['auth', 'verified', 'role:phc_staff,admin'])
    ->prefix('phc')
    ->name('phc.')
    ->group(function () {

        Route::get('/dashboard', [PhcStaffController::class, 'index'])->name('dashboard');
        Route::get('/records', [PhcStaffController::class, 'records'])->name('records');
        Route::get('/create-patient', [PhcStaffController::class, 'create'])->name('create-patient');

        Route::get('/reports', function () {
            return Inertia::render('Phc/PhcReports');
        })->name('reports');

        Route::get('/statistics', [PhcStaffController::class, 'statistics'])->name('statistics');

        Route::get('/all-patients', [PhcStaffController::class, 'allPatients'])->name('all-patients');
        Route::get('/all-patients/{id}', [PhcStaffController::class, 'showAllPatient'])->name('all-patients.show');
        Route::get('/all-patients/{id}/edit', [PhcStaffController::class, 'editAnyPatient'])->name('all-patients.edit');
        Route::patch('/all-patients/{id}', [PhcStaffController::class, 'updateAnyPatient'])->name('all-patients.update');

        Route::post('/patient', [PhcStaffController::class, 'store'])->name('patient.store');
        Route::get('/patients/{id}', [PhcStaffController::class, 'show'])->name('patients.show');
        Route::get('/patients/{id}/edit', [PhcStaffController::class, 'edit'])->name('patients.edit');
        Route::patch('/patients/{id}', [PhcStaffController::class, 'update'])->name('patients.update');
        Route::delete('/patients/{id}', [PhcStaffController::class, 'destroy'])->name('patients.destroy');

        Route::post('/reports/generate', [PhcStaffController::class, 'generateReport'])->name('reports.generate');

        // 🍎 Nutrition Reports
        Route::get('/nutrition-reports', [NutritionReportController::class, 'index'])->name('nutrition.reports.index');
        Route::get('/nutrition-reports/create', [NutritionReportController::class, 'create'])->name('nutrition.reports.create');
        Route::post('/nutrition-reports', [NutritionReportController::class, 'store'])->name('nutrition.reports.store');
        Route::get('/nutrition-reports/{nutritionReport}/edit', [NutritionReportController::class, 'edit'])->name('nutrition.reports.edit');
        Route::put('/nutrition-reports/{nutritionReport}', [NutritionReportController::class, 'update'])->name('nutrition.reports.update');
        Route::delete('/nutrition-reports/{nutritionReport}', [NutritionReportController::class, 'destroy'])->name('nutrition.reports.destroy');
        Route::post('/nutrition-reports/{nutritionReport}/submit', [NutritionReportController::class, 'submit'])->name('nutrition.reports.submit');

        Route::get('/vaccine-accountability', [PhcStaffController::class, 'vaccineAccountability'])->name('vaccine-accountability');
        Route::post('/vaccine-accountability', [PhcStaffController::class, 'storeVaccineAccountability'])->name('vaccine-accountability.store');
        Route::post('/vaccine-accountability/draft', [PhcStaffController::class, 'saveVaccineAccountabilityDraft'])->name('vaccine-accountability.draft');
        Route::get('/vaccine-reports', [PhcStaffController::class, 'vaccineAccountabilityReports'])->name('vaccine-reports.index');
        Route::get('/vaccine-reports/{id}', [PhcStaffController::class, 'showVaccineReport'])->name('vaccine-reports.show');

        Route::get('/search', [PhcStaffController::class, 'patientSearch'])->name('search');
        Route::get('/patient/{id}/dashboard', [PhcStaffController::class, 'patientDashboard'])->name('patient.dashboard');
        Route::post('/patient/{id}/anc', [PhcStaffController::class, 'addAnc'])->name('patient.anc.store');
        Route::post('/patient/{id}/delivery', [PhcStaffController::class, 'addDelivery'])->name('patient.delivery.store');
        Route::post('/patient/{id}/pnc', [PhcStaffController::class, 'addPnc'])->name('patient.pnc.store');
        Route::post('/patient/{id}/fp', [PhcStaffController::class, 'addFamilyPlanning'])->name('patient.fp.store');
        Route::delete('/patient/{id}/fp/{visitId}', [PhcStaffController::class, 'deleteFamilyPlanningVisit'])->name('patient.fp.delete');

        Route::get('/children', [ChildController::class, 'index'])->name('children.index');
        Route::get('/children/create', [ChildController::class, 'create'])->name('children.create');
        Route::post('/children', [ChildController::class, 'store'])->name('children.store');
        Route::get('/children/{child}', [ChildController::class, 'show'])->name('children.show');
        Route::get('/children/{child}/edit', [ChildController::class, 'edit'])->name('children.edit');
        Route::patch('/children/{child}', [ChildController::class, 'update'])->name('children.update');
        Route::post('/children/{child}/immunization', [ChildController::class, 'addImmunization'])->name('children.immunization.store');
        Route::post('/children/{child}/nutrition', [ChildController::class, 'addNutritionLog'])->name('children.nutrition.store');
        Route::get('/children/{child}/nutrition-logs', [ChildController::class, 'nutritionLogs'])->name('children.nutrition.logs');
    });

// 🧑‍💼 ADMIN ROUTES
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');

        Route::get('/dashboard/anc', [AdminController::class, 'ancAnalytics'])->name('dashboard.anc');
        Route::get('/dashboard/delivery', [AdminController::class, 'deliveryAnalytics'])->name('dashboard.delivery');
        Route::get('/dashboard/immunization', [AdminController::class, 'immunizationAnalytics'])->name('dashboard.immunization');
        Route::get('/dashboard/fp', [AdminController::class, 'familyPlanningAnalytics'])->name('dashboard.fp');
        Route::get('/dashboard/hiv', [AdminController::class, 'hivAnalytics'])->name('dashboard.hiv');
        Route::get('/dashboard/facilities', [AdminController::class, 'facilitiesAnalytics'])->name('dashboard.facilities');

        Route::post('/create-phc', [AdminController::class, 'createPhc'])->name('createPhc');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::post('/reports/export', [ReportController::class, 'export'])->name('reports.export');

        Route::get('/patients', [AdminController::class, 'allPatients'])->name('patients.index');
        Route::get('/patients/{id}', [AdminController::class, 'showPatient'])->name('patients.show');
        Route::get('/patients/{id}/edit', [AdminController::class, 'editPatient'])->name('patients.edit');
        Route::patch('/patients/{id}', [AdminController::class, 'updatePatient'])->name('patients.update');
        Route::delete('/patients/{id}', [AdminController::class, 'destroyPatient'])->name('patients.destroy');
        Route::get('/patients/export', [AdminController::class, 'exportPatients'])->name('patients.export');

        Route::get('/manage-locations', [LgaController::class, 'index'])->name('manage-locations');
        Route::post('/lgas', [LgaController::class, 'store'])->name('lgas.store');
        Route::post('/wards', [WardController::class, 'store'])->name('wards.store');

        Route::get('/manage-facilities', [PhcController::class, 'adminIndex'])->name('manage-facilities');
        Route::post('/phcs', [PhcController::class, 'store'])->name('phcs.store');

        Route::get('/nutrition-reports', [NutritionReportController::class, 'adminIndex'])->name('nutrition.reports.index');
        Route::get('/nutrition-statistics', [NutritionReportController::class, 'adminStatistics'])->name('nutrition.statistics');
        Route::get('/nutrition-export', [NutritionReportController::class, 'export'])->name('nutrition.export');

        // 🩺 ADMIN VACCINE REPORT ROUTES
        Route::get('/vaccine-reports', [AdminVaccineController::class, 'index'])->name('vaccine.reports.index');
        Route::get('/vaccine-statistics', [AdminVaccineController::class, 'statistics'])->name('vaccine.statistics');
        Route::get('/vaccine-reports/{id}', [AdminVaccineController::class, 'show'])->name('vaccine.reports.show');
        Route::get('/vaccine-export', [AdminVaccineController::class, 'export'])->name('vaccine.export');

        // ✅ FIXED ROUTE NAME (NO DUPLICATE "admin.")
        Route::patch(
            '/vaccine-reports/{id}/status',
            [AdminVaccineController::class, 'updateStatus']
        )->name('vaccine.reports.update');

        Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');
        Route::get('/statistics/anc', [StatisticsController::class, 'ancStatistics'])->name('statistics.anc');
        Route::get('/statistics/pnc', [StatisticsController::class, 'pncStatistics'])->name('statistics.pnc');
        Route::get('/statistics/family-planning', [StatisticsController::class, 'fpStatistics'])->name('statistics.fp');
        Route::get('/statistics/nutrition', [StatisticsController::class, 'nutritionStatistics'])->name('statistics.nutrition');
        Route::get('/statistics/immunization', [StatisticsController::class, 'immunizationStatistics'])->name('statistics.immunization');

        Route::get('/records', function () {
            return Inertia::render('Admin/AllPatients');
        })->name('records');

        Route::get('/manage-data', function () {
            return Inertia::render('Admin/ManageData');
        })->name('manage-data');
    });

// 🎯 Role-based dashboard redirect
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
