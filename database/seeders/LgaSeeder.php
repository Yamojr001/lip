<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lga;

class LgaSeeder extends Seeder
{
    public function run(): void
    {
        // Major LGAs in Kaduna State
        $lgas = [
            ['name' => 'Kaduna North', 'code' => 'KDN'],
            ['name' => 'Kaduna South', 'code' => 'KDS'],
            ['name' => 'Zaria', 'code' => 'ZAR'],
            ['name' => 'Sabon Gari', 'code' => 'SBG'],
            ['name' => 'Chikun', 'code' => 'CHK'],
            ['name' => 'Igabi', 'code' => 'IGB'],
            ['name' => 'Giwa', 'code' => 'GIW'],
            ['name' => 'Birnin Gwari', 'code' => 'BNG'],
            ['name' => 'Lere', 'code' => 'LER'],
            ['name' => 'Kachia', 'code' => 'KCH'],
        ];

        foreach ($lgas as $lga) {
            Lga::updateOrCreate(['code' => $lga['code']], $lga);
        }
    }
}
