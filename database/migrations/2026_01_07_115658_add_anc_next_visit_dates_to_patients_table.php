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
            // Add next visit date columns for ANC visits 1-8
            for ($i = 1; $i <= 8; $i++) {
                if (!Schema::hasColumn('patients', "anc_visit_{$i}_next_date")) {
                    $table->date("anc_visit_{$i}_next_date")->nullable()->after("anc_visit_{$i}_date");
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // Drop the added columns
            for ($i = 1; $i <= 8; $i++) {
                if (Schema::hasColumn('patients', "anc_visit_{$i}_next_date")) {
                    $table->dropColumn("anc_visit_{$i}_next_date");
                }
            }
        });
    }
};