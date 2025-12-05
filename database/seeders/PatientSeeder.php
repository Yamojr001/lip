<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Carbon\Carbon;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some sample data
        $lgas = Lga::all();
        $wards = Ward::all();
        $phcs = Phc::all();

        if ($lgas->isEmpty() || $wards->isEmpty() || $phcs->isEmpty()) {
            $this->command->info('Please seed LGAs, Wards, and PHCs first!');
            return;
        }

        $patients = [];

        // Generate 60 patients
        for ($i = 1; $i <= 60; $i++) {
            $lga = $lgas->random();
            $ward = $wards->random();
            $phc = $phcs->random();

            // Random dates in 2025
            $registrationDate = Carbon::create(2025, rand(1, 6), rand(1, 28))->format('Y-m-d');
            $edd = Carbon::parse($registrationDate)->addDays(rand(180, 280))->format('Y-m-d');
            
            // Determine if patient has delivered
            $hasDelivered = rand(0, 1);
            $deliveryDate = $hasDelivered ? Carbon::parse($edd)->subDays(rand(0, 14))->format('Y-m-d') : null;
            
            // ANC visits
            $anc1Date = Carbon::parse($registrationDate)->addDays(rand(0, 30))->format('Y-m-d');
            $anc2Date = Carbon::parse($anc1Date)->addDays(rand(28, 56))->format('Y-m-d');
            $anc3Date = Carbon::parse($anc2Date)->addDays(rand(28, 56))->format('Y-m-d');
            $anc4Date = rand(0, 1) ? Carbon::parse($anc3Date)->addDays(rand(28, 56))->format('Y-m-d') : null;

            // Literacy status
            $literacyStatus = ['Literate', 'Illiterate', 'Not sure'][rand(0, 2)];
            
            // FP interest
            $fpInterest = ['Yes', 'No'][rand(0, 1)];
            
            // HIV test results
            $hivResult = rand(0, 10) > 8 ? 'Positive' : 'Negative'; // 80% negative, 20% positive
            
            // Insurance status
            $insuranceStatus = ['Yes', 'No', 'Not Enrolled'][rand(0, 2)];
            $insuranceType = $insuranceStatus === 'Yes' ? ['NHIS', 'Kachima', 'Others'][rand(0, 2)] : null;

            // Generate patient data
            $patient = [
                'woman_name' => $this->generateWomanName($i),
                'age' => rand(18, 40),
                'literacy_status' => $literacyStatus,
                'phone_number' => '080' . rand(10000000, 99999999),
                'husband_name' => $this->generateHusbandName($i),
                'husband_phone' => '080' . rand(10000000, 99999999),
                'community' => $this->generateCommunity($i),
                'address' => $this->generateAddress($i),
                'lga_id' => $lga->id,
                'ward_id' => $ward->id,
                'health_facility_id' => $phc->id,
                'gravida' => rand(1, 6),
                'parity' => rand(0, 5),
                'date_of_registration' => $registrationDate,
                'edd' => $edd,
                'fp_interest' => $fpInterest,
                
                // ANC Visit 1
                'anc_visit_1_date' => $anc1Date,
                'tracked_before_anc1' => rand(0, 1),
                'anc1_paid' => rand(0, 1),
                'anc1_payment_amount' => rand(0, 1) ? rand(1000, 3000) : null,
                'anc1_urinalysis' => rand(0, 1),
                'anc1_iron_folate' => rand(0, 1),
                'anc1_mms' => rand(0, 1),
                'anc1_sp' => rand(0, 1),
                'anc1_sba' => rand(0, 1),
                'anc1_hiv_test' => 'Yes',
                'anc1_hiv_result_received' => true,
                'anc1_hiv_result' => $hivResult,
                
                // ANC Visit 2
                'anc_visit_2_date' => $anc2Date,
                'tracked_before_anc2' => rand(0, 1),
                'anc2_paid' => rand(0, 1),
                'anc2_payment_amount' => rand(0, 1) ? rand(1000, 3000) : null,
                'anc2_urinalysis' => rand(0, 1),
                'anc2_iron_folate' => rand(0, 1),
                'anc2_mms' => rand(0, 1),
                'anc2_sp' => rand(0, 1),
                'anc2_sba' => rand(0, 1),
                'anc2_hiv_test' => rand(0, 1) ? 'Yes' : 'No',
                'anc2_hiv_result_received' => rand(0, 1),
                'anc2_hiv_result' => $hivResult,
                
                // ANC Visit 3
                'anc_visit_3_date' => $anc3Date,
                'tracked_before_anc3' => rand(0, 1),
                'anc3_paid' => rand(0, 1),
                'anc3_payment_amount' => rand(0, 1) ? rand(1000, 3000) : null,
                'anc3_urinalysis' => rand(0, 1),
                'anc3_iron_folate' => rand(0, 1),
                'anc3_mms' => rand(0, 1),
                'anc3_sp' => rand(0, 1),
                'anc3_sba' => rand(0, 1),
                'anc3_hiv_test' => rand(0, 1) ? 'Yes' : 'No',
                'anc3_hiv_result_received' => rand(0, 1),
                'anc3_hiv_result' => $hivResult,
                
                // ANC Visit 4
                'anc_visit_4_date' => $anc4Date,
                'tracked_before_anc4' => $anc4Date ? rand(0, 1) : false,
                'anc4_paid' => $anc4Date ? rand(0, 1) : false,
                'anc4_payment_amount' => $anc4Date && rand(0, 1) ? rand(1000, 3000) : null,
                'anc4_urinalysis' => $anc4Date ? rand(0, 1) : false,
                'anc4_iron_folate' => $anc4Date ? rand(0, 1) : false,
                'anc4_mms' => $anc4Date ? rand(0, 1) : false,
                'anc4_sp' => $anc4Date ? rand(0, 1) : false,
                'anc4_sba' => $anc4Date ? rand(0, 1) : false,
                'anc4_hiv_test' => $anc4Date ? (rand(0, 1) ? 'Yes' : 'No') : null,
                'anc4_hiv_result_received' => $anc4Date ? rand(0, 1) : false,
                'anc4_hiv_result' => $anc4Date ? $hivResult : null,
                
                'additional_anc_count' => rand(0, 2),
                'place_of_delivery' => $hasDelivered ? ['Health Facility', 'Home', 'Other'][rand(0, 2)] : null,
                'delivery_kits_received' => $hasDelivered ? rand(0, 1) : false,
                'type_of_delivery' => $hasDelivered ? ['Normal (Vaginal)', 'Cesarean Section'][rand(0, 1)] : null,
                'delivery_outcome' => $hasDelivered ? ['Live birth', 'Stillbirth'][rand(0, 1)] : null,
                'date_of_delivery' => $deliveryDate,
                
                // PNC Visits
                'pnc_visit_1' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(1, 3))->format('Y-m-d') : null,
                'pnc_visit_2' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(10, 20))->format('Y-m-d') : null,
                'pnc_visit_3' => $hasDelivered && rand(0, 1) ? Carbon::parse($deliveryDate)->addDays(rand(25, 40))->format('Y-m-d') : null,
                
                // Insurance
                'health_insurance_status' => $insuranceStatus,
                'insurance_type' => $insuranceType,
                'insurance_other_specify' => $insuranceType === 'Other' ? 'Private Insurance' : null,
                'insurance_satisfaction' => $insuranceStatus === 'Yes' ? rand(0, 1) : false,
                
                // Family Planning
                'fp_using' => rand(0, 1),
                'fp_male_condom' => rand(0, 1),
                'fp_female_condom' => rand(0, 1),
                'fp_pill' => rand(0, 1),
                'fp_injectable' => rand(0, 1),
                'fp_implant' => rand(0, 1),
                'fp_iud' => rand(0, 1),
                'fp_other' => rand(0, 1),
                'fp_other_specify' => rand(0, 1) ? 'Natural Method' : null,
                
                // Child information (if delivered)
                'child_name' => $hasDelivered ? $this->generateChildName($i) : null,
                'child_dob' => $deliveryDate,
                'child_gender' => $hasDelivered ? ['Male', 'Female'][rand(0, 1)] : null,
                
                // Immunization
                'bcg_received' => $hasDelivered,
                'bcg_date' => $hasDelivered ? $deliveryDate : null,
                'hep0_received' => $hasDelivered,
                'hep0_date' => $hasDelivered ? $deliveryDate : null,
                'opv0_received' => $hasDelivered,
                'opv0_date' => $hasDelivered ? $deliveryDate : null,
                'penta1_received' => $hasDelivered,
                'penta1_date' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(28, 42))->format('Y-m-d') : null,
                'pcv1_received' => $hasDelivered,
                'pcv1_date' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(28, 42))->format('Y-m-d') : null,
                'opv1_received' => $hasDelivered,
                'opv1_date' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(28, 42))->format('Y-m-d') : null,
                'rota1_received' => $hasDelivered,
                'rota1_date' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(28, 42))->format('Y-m-d') : null,
                'ipv1_received' => $hasDelivered,
                'ipv1_date' => $hasDelivered ? Carbon::parse($deliveryDate)->addDays(rand(28, 42))->format('Y-m-d') : null,
                
                'remark' => $this->generateRemark($hasDelivered, $hivResult),
                'comments' => $this->generateComments($i),
                'phc_id' => $phc->id,
            ];

            $patients[] = $patient;
        }

        foreach ($patients as $patientData) {
            // Generate unique ID
            $lga = Lga::find($patientData['lga_id']);
            $ward = Ward::find($patientData['ward_id']);
            
            $lga_code = strtoupper(substr($lga->code ?? $lga->name, 0, 3));
            $ward_code = strtoupper(substr($ward->code ?? $ward->name, 0, 3));
            
            $serial = str_pad(
                Patient::where('lga_id', $patientData['lga_id'])->where('ward_id', $patientData['ward_id'])->count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );
            
            $patientData['unique_id'] = "{$lga_code}/{$ward_code}/{$serial}";
            
            Patient::create($patientData);
        }

        $this->command->info('60 sample patients for 2025 created successfully!');
    }

    /**
     * Generate woman names
     */
    private function generateWomanName($index): string
    {
        $firstNames = ['Fatima', 'Halima', 'Zainab', 'Aisha', 'Maryam', 'Hauwa', 'Amina', 'Rahma', 'Safiya', 'Khadija'];
        $lastNames = ['Sani', 'Yusuf', 'Abdullahi', 'Bello', 'Ibrahim', 'Mohammed', 'Umar', 'Musa', 'Omar', 'Ali'];
        
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        
        return $firstName . ' ' . $lastName;
    }

    /**
     * Generate husband names
     */
    private function generateHusbandName($index): string
    {
        $firstNames = ['Mohammed', 'Yusuf', 'Abdullahi', 'Bello', 'Ibrahim', 'Sani', 'Umar', 'Musa', 'Omar', 'Ali'];
        $lastNames = ['Sani', 'Yusuf', 'Abdullahi', 'Bello', 'Ibrahim', 'Mohammed', 'Umar', 'Musa', 'Omar', 'Ali'];
        
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        
        return $firstName . ' ' . $lastName;
    }

    /**
     * Generate child names
     */
    private function generateChildName($index): string
    {
        $firstNames = ['Amina', 'Fatima', 'Halima', 'Zainab', 'Mohammed', 'Yusuf', 'Abdullahi', 'Ibrahim'];
        $lastNames = ['Sani', 'Yusuf', 'Abdullahi', 'Bello', 'Ibrahim', 'Mohammed'];
        
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        
        return $firstName . ' ' . $lastName;
    }

    /**
     * Generate communities
     */
    private function generateCommunity($index): string
    {
        $communities = ['Zaria', 'Daura', 'Katsina', 'Funtua', 'Malumfashi', 'Dutsinma', 'Kankia', 'Mani', 'Bindawa', 'Ingawa'];
        return $communities[array_rand($communities)];
    }

    /**
     * Generate addresses
     */
    private function generateAddress($index): string
    {
        $streets = ['Main Street', 'Market Road', 'School Road', 'Hospital Road', 'Station Road', 'Airport Road', 'Church Road', 'Mosque Road'];
        $areas = ['Ungogo', 'Sabon Gari', 'Tudun Wada', 'Nassarawa', 'GRA', 'Low Cost', 'Old Airport'];
        
        $street = $streets[array_rand($streets)];
        $area = $areas[array_rand($areas)];
        
        return rand(1, 999) . ' ' . $street . ', ' . $area;
    }

    /**
     * Generate remarks based on patient status
     */
    private function generateRemark($hasDelivered, $hivResult): string
    {
        $remarks = [];
        
        if ($hasDelivered) {
            $remarks[] = 'Successfully delivered at health facility.';
            $remarks[] = 'Home delivery with good outcome.';
            $remarks[] = 'Regular ANC attendance throughout pregnancy.';
            $remarks[] = 'Cooperative patient with good follow-up.';
        } else {
            $remarks[] = 'Regular ANC visits ongoing.';
            $remarks[] = 'Patient responsive to ANC services.';
            $remarks[] = 'Good pregnancy progression.';
            $remarks[] = 'Requires follow-up for next ANC visit.';
        }
        
        if ($hivResult === 'Positive') {
            $remarks[] = 'HIV positive - on ART treatment.';
        }
        
        if (rand(0, 1)) {
            $remarks[] = 'Family planning education provided.';
        }
        
        return implode(' ', array_slice($remarks, 0, rand(1, 3)));
    }

    /**
     * Generate comments
     */
    private function generateComments($index): string
    {
        $comments = [
            'Regular follow-up maintained throughout pregnancy.',
            'Showed good understanding of maternal health practices.',
            'Encouraged facility delivery for next pregnancy.',
            'Educated on importance of completing ANC visits.',
            'Good adherence to medication and supplements.',
            'Active participation in health education sessions.',
            'Family support system appears strong.',
            'Transportation challenges noted.',
            'Financial constraints affecting service utilization.',
            'Excellent patient compliance with appointments.'
        ];
        
        return $comments[array_rand($comments)];
    }
}