<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;
use Carbon\Carbon;

class SendEddReminders extends Command
{
    protected $signature = 'notifications:edd-reminders';
    protected $description = 'Send expected delivery date reminders to patients';

    public function handle()
    {
        $notificationService = new NotificationService();
        $patients = $notificationService->getUpcomingEddPatients(14);
        
        $count = 0;
        foreach ($patients as $patient) {
            $daysUntilEdd = Carbon::parse($patient->edd)->diffInDays(now(), false) * -1;
            
            if (in_array(abs($daysUntilEdd), [14, 7, 3, 1, 0])) {
                $notificationService->sendEddReminder($patient, $daysUntilEdd);
                $count++;
            }
        }
        
        $this->info("Sent {$count} EDD reminder(s).");
        return Command::SUCCESS;
    }
}
