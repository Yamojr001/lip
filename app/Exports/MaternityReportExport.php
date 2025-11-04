<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class MaternityReportExport implements WithMultipleSheets
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

    public function sheets(): array
    {
        $sheets = [];

        // Sheet 1: Summary Dashboard
        $sheets[] = new SummarySheet($this->summary, $this->charts);

        // Sheet 2: Raw Data
        $sheets[] = new RawDataSheet($this->data);

        // Sheet 3: Charts Data
        $sheets[] = new ChartsDataSheet($this->charts);

        return $sheets;
    }
}

class SummarySheet implements FromCollection, WithTitle, WithStyles
{
    protected $summary;
    protected $charts;

    public function __construct($summary, $charts)
    {
        $this->summary = $summary;
        $this->charts = $charts;
    }

    public function collection()
    {
        $data = collect();

        // Header
        $data->push(['MATERNITY CARE REPORT - SUMMARY DASHBOARD']);
        $data->push(['Generated on: ' . now()->format('Y-m-d H:i:s')]);
        $data->push([]);

        // Key Metrics
        $data->push(['KEY METRICS']);
        $data->push(['Total Patients', $this->summary['total_patients'] ?? 0]);
        $data->push(['ANC4 Completed', $this->summary['anc4_completed'] ?? 0]);
        $data->push(['ANC4 Completion Rate', ($this->summary['anc4_completion_rate'] ?? 0) . '%']);
        $data->push(['PNC Completed', $this->summary['pnc_completed'] ?? 0]);
        $data->push(['PNC Completion Rate', ($this->summary['pnc_completion_rate'] ?? 0) . '%']);
        $data->push(['Live Births', $this->summary['live_births'] ?? 0]);
        $data->push(['Stillbirths', $this->summary['stillbirths'] ?? 0]);
        $data->push([]);

        // Literacy Status
        $data->push(['LITERACY STATUS DISTRIBUTION']);
        if (isset($this->charts['literacy_status'])) {
            foreach ($this->charts['literacy_status'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }
        $data->push([]);

        // Delivery Outcomes
        $data->push(['DELIVERY OUTCOMES']);
        if (isset($this->charts['delivery_outcomes'])) {
            foreach ($this->charts['delivery_outcomes'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }
        $data->push([]);

        // ANC Completion
        $data->push(['ANC COMPLETION STATUS']);
        if (isset($this->charts['anc_completion'])) {
            foreach ($this->charts['anc_completion'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }

        return $data;
    }

    public function title(): string
    {
        return 'Summary Dashboard';
    }

    public function styles(Worksheet $sheet)
    {
        // Set column widths
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(15);

        // Style headers
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A4')->getFont()->setBold(true);
        $sheet->getStyle('A11')->getFont()->setBold(true);
        $sheet->getStyle('A16')->getFont()->setBold(true);
        $sheet->getStyle('A20')->getFont()->setBold(true);

        // Add borders to data sections
        $lastRow = $sheet->getHighestRow();
        
        return [
            'A1:B3' => [
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E6F3FF']
                ]
            ],
            'A4:B9' => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
            ],
        ];
    }
}

class RawDataSheet implements FromCollection, WithHeadings, WithTitle, WithStyles
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
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
                'husband_name' => $patient['husband_name'] ?? '',
                'community' => $patient['community'] ?? '',
                'gravida' => $patient['gravida'] ?? '',
                'parity' => $patient['parity'] ?? '',
                'date_of_registration' => $patient['date_of_registration'] ?? '',
                'edd' => $patient['edd'] ?? '',
                'anc_visits_count' => $patient['anc_visits_count'] ?? 0,
                'anc4_completed' => $patient['anc4_completed'] ? 'Yes' : 'No',
                'place_of_delivery' => $patient['place_of_delivery'] ?? '',
                'delivery_outcome' => $patient['delivery_outcome'] ?? '',
                'date_of_delivery' => $patient['date_of_delivery'] ?? '',
                'pnc_completed' => $patient['pnc_completed'] ? 'Yes' : 'No',
                'health_insurance_status' => $patient['health_insurance_status'] ?? '',
                'delivery_kits_received' => $patient['delivery_kits_received'] ? 'Yes' : 'No',
                'alert' => $patient['alert'] ?? '',
                'remark' => $patient['remark'] ?? '',
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Patient ID',
            'Woman Name',
            'Age',
            'Literacy Status',
            'Phone Number',
            'Husband Name',
            'Community',
            'Gravida',
            'Parity',
            'Registration Date',
            'EDD',
            'ANC Visits',
            'ANC4 Completed',
            'Place of Delivery',
            'Delivery Outcome',
            'Delivery Date',
            'PNC Completed',
            'Insurance Status',
            'Delivery Kit Received',
            'Alert Status',
            'Remarks'
        ];
    }

    public function title(): string
    {
        return 'Patient Data';
    }

    public function styles(Worksheet $sheet)
    {
        // Auto-size columns
        foreach (range('A', 'U') as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        // Style header row
        $sheet->getStyle('A1:U1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '366092']
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Add borders to all cells
        $lastRow = $sheet->getHighestRow();
        $sheet->getStyle("A1:U{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'DDDDDD'],
                ],
            ],
        ]);

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class ChartsDataSheet implements FromCollection, WithTitle, WithStyles
{
    protected $charts;

    public function __construct($charts)
    {
        $this->charts = $charts;
    }

    public function collection()
    {
        $data = collect();

        $data->push(['CHARTS AND ANALYTICS DATA']);
        $data->push(['Generated on: ' . now()->format('Y-m-d H:i:s')]);
        $data->push([]);

        // Literacy Status
        $data->push(['LITERACY STATUS']);
        $data->push(['Category', 'Count']);
        if (isset($this->charts['literacy_status'])) {
            foreach ($this->charts['literacy_status'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }
        $data->push([]);

        // ANC Completion
        $data->push(['ANC COMPLETION']);
        $data->push(['Category', 'Count']);
        if (isset($this->charts['anc_completion'])) {
            foreach ($this->charts['anc_completion'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }
        $data->push([]);

        // Delivery Outcomes
        $data->push(['DELIVERY OUTCOMES']);
        $data->push(['Outcome', 'Count']);
        if (isset($this->charts['delivery_outcomes'])) {
            foreach ($this->charts['delivery_outcomes'] as $item) {
                $data->push([$item['name'], $item['value']]);
            }
        }
        $data->push([]);

        // Monthly Registrations
        $data->push(['MONTHLY REGISTRATIONS']);
        $data->push(['Month', 'Registrations']);
        if (isset($this->charts['monthly_registrations'])) {
            foreach ($this->charts['monthly_registrations'] as $item) {
                $data->push([$item['month'], $item['registrations']]);
            }
        }
        $data->push([]);

        // Age Distribution
        $data->push(['AGE DISTRIBUTION']);
        $data->push(['Age Group', 'Count']);
        if (isset($this->charts['age_distribution'])) {
            foreach ($this->charts['age_distribution'] as $item) {
                $data->push([$item['age_group'], $item['count']]);
            }
        }

        return $data;
    }

    public function title(): string
    {
        return 'Analytics Data';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getColumnDimension('A')->setWidth(25);
        $sheet->getColumnDimension('B')->setWidth(15);

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            4 => ['font' => ['bold' => true]],
            9 => ['font' => ['bold' => true]],
            14 => ['font' => ['bold' => true]],
            19 => ['font' => ['bold' => true]],
            24 => ['font' => ['bold' => true]],
        ];
    }
}