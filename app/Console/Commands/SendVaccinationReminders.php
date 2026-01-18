<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\NotificationService;

class SendVaccinationReminders extends Command
{
    protected $signature = 'notifications:vaccination-reminders';
    protected $description = 'Send vaccination reminders for children due for immunization';

    public function handle()
    {
        $notificationService = new NotificationService();
        $dueChildren = $notificationService->getChildrenDueForVaccination();
        
        $count = 0;
        foreach ($dueChildren as $item) {
            $notificationService->sendVaccinationReminder($item['child'], $item['vaccines']);
            $count++;
        }
        
        $this->info("Sent {$count} vaccination reminder(s).");
        return Command::SUCCESS;
    }
}
