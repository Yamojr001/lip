<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class SendAncReminders extends Command
{
    protected $signature = 'notifications:anc-reminders';
    protected $description = 'Send ANC visit reminders to overdue patients';

    public function handle()
    {
        $notificationService = new NotificationService();
        $patients = $notificationService->getOverdueAncPatients();
        
        $count = 0;
        foreach ($patients as $patient) {
            $notificationService->sendAncReminder($patient);
            $count++;
        }
        
        $this->info("Sent {$count} ANC reminder(s).");
        return Command::SUCCESS;
    }
}
