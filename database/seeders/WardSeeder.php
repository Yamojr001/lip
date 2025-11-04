<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ward;
use App\Models\Lga;

class WardSeeder extends Seeder
{
    public function run(): void
    {
        $wards = [
            // Kaduna North
            ['name' => 'Unguwan Shanu', 'code' => 'UGS', 'lga' => 'KDN'],
            ['name' => 'Badarawa', 'code' => 'BDR', 'lga' => 'KDN'],
            ['name' => 'Kawo', 'code' => 'KAW', 'lga' => 'KDN'],

            // Kaduna South
            ['name' => 'Makera', 'code' => 'MKR', 'lga' => 'KDS'],
            ['name' => 'Tudun Wada', 'code' => 'TDW', 'lga' => 'KDS'],
            ['name' => 'Kakuri', 'code' => 'KKR', 'lga' => 'KDS'],

            // Zaria
            ['name' => 'Samaru', 'code' => 'SMR', 'lga' => 'ZAR'],
            ['name' => 'Kongo', 'code' => 'KNG', 'lga' => 'ZAR'],
            ['name' => 'Wusasa', 'code' => 'WUS', 'lga' => 'ZAR'],

            // Chikun
            ['name' => 'Narayi', 'code' => 'NRY', 'lga' => 'CHK'],
            ['name' => 'Sabon Tasha', 'code' => 'SBT', 'lga' => 'CHK'],

            // Igabi
            ['name' => 'Rigachikun', 'code' => 'RGC', 'lga' => 'IGB'],
            ['name' => 'Afaka', 'code' => 'AFK', 'lga' => 'IGB'],

            // Giwa
            ['name' => 'Shika', 'code' => 'SHK', 'lga' => 'GIW'],
            ['name' => 'Dan Mahawayi', 'code' => 'DMH', 'lga' => 'GIW'],

            // Kachia
            ['name' => 'Ankwa', 'code' => 'ANK', 'lga' => 'KCH'],
            ['name' => 'Kachia Urban', 'code' => 'KCU', 'lga' => 'KCH'],

            // Lere
            ['name' => 'Lere Town', 'code' => 'LRT', 'lga' => 'LER'],
            ['name' => 'Garun Kurama', 'code' => 'GRK', 'lga' => 'LER'],

            // Birnin Gwari
            ['name' => 'Gayam', 'code' => 'GAY', 'lga' => 'BNG'],
            ['name' => 'Magajin Gari', 'code' => 'MGG', 'lga' => 'BNG'],
        ];

        foreach ($wards as $ward) {
            $lga = Lga::where('code', $ward['lga'])->first();
            if ($lga) {
                Ward::updateOrCreate(
                    ['code' => $ward['code']],
                    ['name' => $ward['name'], 'lga_id' => $lga->id]
                );
            }
        }
    }
}
