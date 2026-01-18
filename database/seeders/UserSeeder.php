<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Phc;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $phc = Phc::first();

        User::updateOrCreate(
            ['email' => 'admin@lafiyariyali.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phc_id' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'phc@lafiyariyali.com'],
            [
                'name' => 'PHC Staff',
                'password' => Hash::make('password'),
                'role' => 'phc_staff',
                'phc_id' => $phc?->id,
            ]
        );
    }
}
