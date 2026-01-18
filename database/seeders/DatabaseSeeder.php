<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // LgaSeeder::class,
            // WardSeeder::class,
            // PhcSeeder::class,
            UserSeeder::class,
            PatientSeeder::class,
        ]);
    }
}