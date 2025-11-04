use Illuminate\Support\Facades\Route;

Route::get('/reports', function () {
    return response()->json([
        'kpis' => [
            'anc_registrations' => 1240,
            'anc4_rate' => 72,
            'hospital_delivery_rate' => 68,
            'live_birth_rate' => 94,
        ],
        'charts' => [
            'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            'anc_monthly' => [120, 140, 150, 170, 180, 190, 210],
            'delivery_outcomes' => [450, 12, 8, 6],
            'anc_progress' => [15, 18, 22, 25, 27, 30, 35],
            'target' => 25,
            'lga_names' => ['Kano North', 'Dala', 'Nassarawa', 'Tarauni', 'Gwale'],
            'lga_anc4' => [70, 65, 78, 60, 66],
        ],
    ]);
});
