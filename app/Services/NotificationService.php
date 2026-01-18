<?php

namespace App\Services;

use App\Models\Patient;
use App\Models\Child;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NotificationService
{
    protected $smsEnabled = false;
    protected $emailEnabled = true;
    
    public function __construct()
    {
        $this->smsEnabled = !empty(env('TWILIO_SID')) && !empty(env('TWILIO_TOKEN'));
        $this->emailEnabled = !empty(env('MAIL_HOST'));
    }

    public function sendEddReminder(Patient $patient, int $daysUntilEdd)
    {
        $message = $this->getEddMessage($patient, $daysUntilEdd);
        
        if ($patient->phone_number) {
            $this->sendSms($patient->phone_number, $message);
        }
        
        $this->logNotification($patient, 'edd_reminder', $message);
    }

    public function sendAncReminder(Patient $patient)
    {
        $nextVisit = $patient->anc_visits_count + 1;
        $message = "Dear {$patient->woman_name}, your ANC Visit {$nextVisit} is due. Please visit your health facility for your antenatal checkup. - Lafiyar Iyali";
        
        if ($patient->phone_number) {
            $this->sendSms($patient->phone_number, $message);
        }
        
        $this->logNotification($patient, 'anc_reminder', $message);
    }

    public function sendVaccinationReminder(Child $child, array $dueVaccines)
    {
        $vaccineNames = implode(', ', array_map(fn($v) => strtoupper(str_replace('_', ' ', $v)), $dueVaccines));
        $message = "Dear Parent, {$child->child_name} is due for vaccination(s): {$vaccineNames}. Please visit your health facility. - Lafiyar Iyali";
        
        if ($child->mother_phone) {
            $this->sendSms($child->mother_phone, $message);
        }
        
        $this->logNotification($child, 'vaccination_reminder', $message);
    }

    public function sendNutritionAlert(Child $child, string $status)
    {
        $urgency = $status === 'SAM' ? 'URGENT' : 'Important';
        $message = "{$urgency}: {$child->child_name} has been identified as {$status} (malnutrition). Please visit your health facility immediately for treatment. - Lafiyar Iyali";
        
        if ($child->mother_phone) {
            $this->sendSms($child->mother_phone, $message);
        }
        
        $this->logNotification($child, 'nutrition_alert', $message);
    }

    public function sendPncReminder(Patient $patient, int $visitNumber)
    {
        $message = "Dear {$patient->woman_name}, your Postnatal Care Visit {$visitNumber} is due. Please visit your health facility for your postnatal checkup. - Lafiyar Iyali";
        
        if ($patient->phone_number) {
            $this->sendSms($patient->phone_number, $message);
        }
        
        $this->logNotification($patient, 'pnc_reminder', $message);
    }

    public function sendCriticalAlert(Patient $patient, string $alertType, string $details)
    {
        $message = "ALERT: {$patient->woman_name} - {$alertType}: {$details}. Immediate attention required. - Lafiyar Iyali";
        
        if ($patient->phone_number) {
            $this->sendSms($patient->phone_number, $message);
        }
        
        $this->logNotification($patient, 'critical_alert', $message);
    }

    protected function sendSms(string $phoneNumber, string $message): bool
    {
        if (!$this->smsEnabled) {
            Log::info("SMS would be sent to {$phoneNumber}: {$message}");
            return false;
        }

        try {
            $sid = env('TWILIO_SID');
            $token = env('TWILIO_TOKEN');
            $from = env('TWILIO_FROM');

            $phone = $this->formatPhoneNumber($phoneNumber);
            
            $client = new \Twilio\Rest\Client($sid, $token);
            $client->messages->create($phone, [
                'from' => $from,
                'body' => $message
            ]);
            
            Log::info("SMS sent successfully to {$phone}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send SMS: " . $e->getMessage());
            return false;
        }
    }

    protected function formatPhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        if (strlen($phone) === 11 && str_starts_with($phone, '0')) {
            $phone = '234' . substr($phone, 1);
        }
        
        if (!str_starts_with($phone, '+')) {
            $phone = '+' . $phone;
        }
        
        return $phone;
    }

    protected function getEddMessage(Patient $patient, int $daysUntilEdd): string
    {
        if ($daysUntilEdd <= 0) {
            return "Dear {$patient->woman_name}, your expected delivery date has arrived! Please be prepared and contact your health facility if you experience any signs of labor. - Lafiyar Iyali";
        } elseif ($daysUntilEdd <= 7) {
            return "Dear {$patient->woman_name}, your expected delivery date is in {$daysUntilEdd} day(s). Please ensure you have all delivery preparations ready. Contact your health facility immediately if needed. - Lafiyar Iyali";
        } elseif ($daysUntilEdd <= 14) {
            return "Dear {$patient->woman_name}, your expected delivery date is in {$daysUntilEdd} days. Please complete your delivery preparations and stay in touch with your health facility. - Lafiyar Iyali";
        } else {
            return "Dear {$patient->woman_name}, reminder: your expected delivery date is in {$daysUntilEdd} days. Please continue attending your ANC visits. - Lafiyar Iyali";
        }
    }

    protected function logNotification($model, string $type, string $message): void
    {
        Log::channel('daily')->info("Notification sent", [
            'type' => $type,
            'model_type' => get_class($model),
            'model_id' => $model->id,
            'message' => $message,
            'timestamp' => now()->toDateTimeString()
        ]);
    }

    public function getUpcomingEddPatients(int $daysAhead = 14)
    {
        return Patient::whereNotNull('edd')
            ->whereNull('date_of_delivery')
            ->whereBetween('edd', [now(), now()->addDays($daysAhead)])
            ->get();
    }

    public function getOverdueAncPatients()
    {
        return Patient::whereNotNull('edd')
            ->whereNull('date_of_delivery')
            ->where('anc_visits_count', '<', 8)
            ->get()
            ->filter(function ($patient) {
                $lastAncDate = $this->getLastAncDate($patient);
                if (!$lastAncDate) {
                    return Carbon::parse($patient->date_of_registration)->diffInWeeks(now()) >= 4;
                }
                return Carbon::parse($lastAncDate)->diffInWeeks(now()) >= 4;
            });
    }

    public function getChildrenDueForVaccination()
    {
        $children = Child::all();
        $dueChildren = [];

        foreach ($children as $child) {
            $dueVaccines = $this->getDueVaccines($child);
            if (!empty($dueVaccines)) {
                $dueChildren[] = [
                    'child' => $child,
                    'vaccines' => $dueVaccines
                ];
            }
        }

        return $dueChildren;
    }

    protected function getLastAncDate(Patient $patient): ?string
    {
        for ($i = 8; $i >= 1; $i--) {
            $field = "anc_visit_{$i}_date";
            if (!empty($patient->{$field})) {
                return $patient->{$field};
            }
        }
        return null;
    }

    protected function getDueVaccines(Child $child): array
    {
        $ageInWeeks = Carbon::parse($child->date_of_birth)->diffInWeeks(now());
        $dueVaccines = [];

        $schedule = [
            ['age' => 0, 'vaccines' => ['bcg', 'hep0', 'opv0']],
            ['age' => 6, 'vaccines' => ['penta1', 'pcv1', 'opv1', 'rota1', 'ipv1']],
            ['age' => 10, 'vaccines' => ['penta2', 'pcv2', 'rota2', 'opv2']],
            ['age' => 14, 'vaccines' => ['penta3', 'pcv3', 'opv3', 'rota3', 'ipv2']],
            ['age' => 36, 'vaccines' => ['measles1', 'yellow_fever', 'vitamin_a1']],
            ['age' => 60, 'vaccines' => ['measles2', 'vitamin_a2']],
        ];

        foreach ($schedule as $item) {
            if ($ageInWeeks >= $item['age']) {
                foreach ($item['vaccines'] as $vaccine) {
                    $receivedField = "{$vaccine}_received";
                    if (!$child->{$receivedField}) {
                        $dueVaccines[] = $vaccine;
                    }
                }
            }
        }

        return $dueVaccines;
    }
}
