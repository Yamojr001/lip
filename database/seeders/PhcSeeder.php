<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Phc;
use App\Models\Ward;

class PhcSeeder extends Seeder
{
    public function run(): void
    {
        $phcs = [
            ['clinic_name' => 'Unguwan Shanu PHC', 'ward' => 'UGS', 'address' => 'Unguwan Shanu, Kaduna North', 'contact_phone' => '08012345001', 'incharge_name' => 'Nurse Aisha Ibrahim'],
            ['clinic_name' => 'Badarawa Health Center', 'ward' => 'BDR', 'address' => 'Badarawa, Kaduna North', 'contact_phone' => '08012345002', 'incharge_name' => 'Nurse Fatima Yusuf'],
            ['clinic_name' => 'Makera PHC', 'ward' => 'MKR', 'address' => 'Makera, Kaduna South', 'contact_phone' => '08012345003', 'incharge_name' => 'Nurse Hadiza Musa'],
            ['clinic_name' => 'Samaru Health Center', 'ward' => 'SMR', 'address' => 'Samaru, Zaria', 'contact_phone' => '08012345004', 'incharge_name' => 'Nurse Amina Bello'],
            ['clinic_name' => 'Narayi PHC', 'ward' => 'NRY', 'address' => 'Narayi, Chikun', 'contact_phone' => '08012345005', 'incharge_name' => 'Nurse Zainab Sani'],
        ];

        foreach ($phcs as $phc) {
            $ward = Ward::where('code', $phc['ward'])->first();
            if ($ward) {
                Phc::updateOrCreate(
                    ['clinic_name' => $phc['clinic_name']],
                    [
                        'ward_id' => $ward->id,
                        'lga_id' => $ward->lga_id,
                        'address' => $phc['address'],
                        'contact_phone' => $phc['contact_phone'],
                        'incharge_name' => $phc['incharge_name'],
                    ]
                );
            }
        }
    }
}
