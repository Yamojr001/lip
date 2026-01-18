<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('preferred_language', 100)->nullable()->after('address');
            $table->string('blood_pressure', 20)->nullable()->after('fp_interest');
            $table->decimal('weight_kg', 5, 2)->nullable()->after('blood_pressure');
            $table->decimal('height_cm', 5, 2)->nullable()->after('weight_kg');
            $table->string('blood_group', 10)->nullable()->after('height_cm');
            $table->decimal('blood_level', 4, 1)->nullable()->after('blood_group');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn(['preferred_language', 'blood_pressure', 'weight_kg', 'height_cm', 'blood_group', 'blood_level']);
        });
    }
};
