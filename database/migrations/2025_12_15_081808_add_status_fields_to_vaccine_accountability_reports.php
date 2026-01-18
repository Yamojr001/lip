<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaccine_accountability_reports', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejected_reason')->nullable();
            $table->text('revision_notes')->nullable();
        });
        
        DB::statement("ALTER TABLE vaccine_accountability_reports DROP CONSTRAINT IF EXISTS vaccine_accountability_reports_status_check");
        DB::statement("ALTER TABLE vaccine_accountability_reports ADD CONSTRAINT vaccine_accountability_reports_status_check CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'pending_revision'))");
    }

    public function down(): void
    {
        Schema::table('vaccine_accountability_reports', function (Blueprint $table) {
            $table->dropColumn(['approved_at', 'rejected_at', 'rejected_reason', 'revision_notes']);
        });
        
        DB::statement("ALTER TABLE vaccine_accountability_reports DROP CONSTRAINT IF EXISTS vaccine_accountability_reports_status_check");
        DB::statement("ALTER TABLE vaccine_accountability_reports ADD CONSTRAINT vaccine_accountability_reports_status_check CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))");
    }
};
