<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class RawDataSheet implements FromCollection, WithHeadings
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($patient) {
            $p = (object) $patient;
            
            return [
                'unique_id' => $p->unique_id ?? '',
                'woman_name' => $p->woman_name ?? '',
                'age' => $p->age ?? '',
                'literacy_status' => $p->literacy_status ?? '',
                'phone_number' => $p->phone_number ?? '',
                'community' => $p->community ?? '',
                'gravida' => $p->gravida ?? '',
                'parity' => $p->parity ?? '',
                'date_of_registration' => $p->date_of_registration ?? '',
                'edd' => $p->edd ?? '',
                'anc_visits_count' => $p->anc_visits_count ?? 0,
                'anc4_completed' => ($p->anc4_completed ?? false) ? 'Yes' : 'No',
                'place_of_delivery' => $p->place_of_delivery ?? '',
                'delivery_outcome' => $p->delivery_outcome ?? '',
                'date_of_delivery' => $p->date_of_delivery ?? '',
                'pnc_completed' => ($p->pnc_completed ?? false) ? 'Yes' : 'No',
                'health_insurance_status' => $p->health_insurance_status ?? '',
                'delivery_kits_received' => ($p->delivery_kits_received ?? false) ? 'Yes' : 'No',
                'alert' => $p->alert ?? '',
                'remark' => $p->remark ?? '',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Unique ID', 'Woman Name', 'Age', 'Literacy Status', 'Phone Number',
            'Community', 'Gravida', 'Parity', 'Date Registered', 'EDD',
            'ANC Visits', 'ANC4 Completed', 'Place of Delivery', 'Delivery Outcome',
            'Date of Delivery', 'PNC Completed', 'Health Insurance', 'Delivery Kit',
            'Alert', 'Remark'
        ];
    }
}
