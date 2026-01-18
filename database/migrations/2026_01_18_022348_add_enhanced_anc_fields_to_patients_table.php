<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            for ($i = 1; $i <= 8; $i++) {
                $table->boolean("anc{$i}_counseling_hiv_syphilis")->default(false);
                $table->enum("anc{$i}_syphilis_test", ['Positive', 'Negative', 'Not Done'])->nullable();
                $table->boolean("anc{$i}_syphilis_treated")->default(false);
                $table->enum("anc{$i}_hep_b_test", ['Positive', 'Negative', 'Not Done'])->nullable();
                $table->enum("anc{$i}_hep_c_test", ['Positive', 'Negative', 'Not Done'])->nullable();
                $table->boolean("anc{$i}_itn_given")->default(false);
                $table->boolean("anc{$i}_deworming")->default(false);
                $table->boolean("anc{$i}_blood_sugar_checked")->default(false);
                $table->string("anc{$i}_blood_sugar_result", 20)->nullable();
                $table->boolean("anc{$i}_vitamin_fe")->default(false);
                $table->enum("anc{$i}_visit_outcome", ['Continued', 'Referred', 'Delivered', 'Defaulted'])->nullable();
                $table->string("anc{$i}_facility_name", 200)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            for ($i = 1; $i <= 8; $i++) {
                $table->dropColumn([
                    "anc{$i}_counseling_hiv_syphilis",
                    "anc{$i}_syphilis_test",
                    "anc{$i}_syphilis_treated",
                    "anc{$i}_hep_b_test",
                    "anc{$i}_hep_c_test",
                    "anc{$i}_itn_given",
                    "anc{$i}_deworming",
                    "anc{$i}_blood_sugar_checked",
                    "anc{$i}_blood_sugar_result",
                    "anc{$i}_vitamin_fe",
                    "anc{$i}_visit_outcome",
                    "anc{$i}_facility_name",
                ]);
            }
        });
    }
};
