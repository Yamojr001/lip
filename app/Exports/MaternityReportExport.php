<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;

class MaternityReportExport implements WithMultipleSheets, FromCollection
{
    protected $reportType;
    protected $data;
    protected $summary;
    protected $charts;
    protected $filters;

    public function __construct($reportType, $data, $summary, $charts, $filters = [])
    {
        $this->reportType = $reportType;
        $this->data = $data;
        $this->summary = $summary;
        $this->charts = $charts;
        $this->filters = $filters;
    }

    public function collection()
    {
        return collect($this->data)->map(function ($patient) {
            return [
                'unique_id' => $patient['unique_id'] ?? '',
                'woman_name' => $patient['woman_name'] ?? '',
                'age' => $patient['age'] ?? '',
                'literacy_status' => $patient['literacy_status'] ?? '',
                'phone_number' => $patient['phone_number'] ?? '',
                'community' => $patient['community'] ?? '',
                'gravida' => $patient['gravida'] ?? '',
                'parity' => $patient['parity'] ?? '',
                'date_of_registration' => $patient['date_of_registration'] ?? '',
                'edd' => $patient['edd'] ?? '',
                'anc_visits_count' => $patient['anc_visits_count'] ?? 0,
                'anc4_completed' => ($patient['anc4_completed'] ?? false) ? 'Yes' : 'No',
                'place_of_delivery' => $patient['place_of_delivery'] ?? '',
                'delivery_outcome' => $patient['delivery_outcome'] ?? '',
                'date_of_delivery' => $patient['date_of_delivery'] ?? '',
                'pnc_completed' => ($patient['pnc_completed'] ?? false) ? 'Yes' : 'No',
                'health_insurance_status' => $patient['health_insurance_status'] ?? '',
                'delivery_kits_received' => ($patient['delivery_kits_received'] ?? false) ? 'Yes' : 'No',
                'alert' => $patient['alert'] ?? '',
                'remark' => $patient['remark'] ?? '',
            ];
        });
    }

    public function sheets(): array
    {
        return [new RawDataSheet($this->data)];
    }
}
