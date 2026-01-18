<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class VaccineAccountabilityReport extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'phc_id',
        'user_id',
        'month_year',
        'reporting_date',
        'vaccine_utilization',
        'discarded_doses',
        'devices_utilization',
        'device_status',
        'health_officer_name',
        'health_officer_signature',
        'head_of_unit_name',
        'head_of_unit_signature',
        'phone_number',
        'submission_date',
        'status',
        'total_doses_used',
        'total_doses_discarded',
        'vaccine_wastage_rate',
        'stock_out_count',
    ];

    protected $casts = [
        'vaccine_utilization' => 'array',
        'discarded_doses' => 'array',
        'devices_utilization' => 'array',
        'device_status' => 'array',
        'reporting_date' => 'date',
        'submission_date' => 'date',
    ];

    /**
     * Relationships
     */
    public function phc()
    {
        return $this->belongsTo(Phc::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeForPhc($query, $phcId)
    {
        return $query->where('phc_id', $phcId);
    }

    public function scopeForMonth($query, $monthYear)
    {
        return $query->where('month_year', $monthYear);
    }

    /**
     * Calculate metrics before saving
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            // Calculate total doses used
            $totalUsed = 0;
            if (is_array($model->vaccine_utilization)) {
                foreach ($model->vaccine_utilization as $vaccine) {
                    if (isset($vaccine['doses_opened']) && is_numeric($vaccine['doses_opened'])) {
                        $totalUsed += (int) $vaccine['doses_opened'];
                    }
                }
            }
            $model->total_doses_used = $totalUsed;

            // Calculate total doses discarded
            $totalDiscarded = 0;
            if (is_array($model->discarded_doses)) {
                foreach ($model->discarded_doses as $discarded) {
                    $reasons = ['expiry', 'breakage', 'vvm_change', 'frozen', 'label_removed'];
                    foreach ($reasons as $reason) {
                        if (isset($discarded[$reason]) && is_numeric($discarded[$reason])) {
                            $totalDiscarded += (int) $discarded[$reason];
                        }
                    }
                }
            }
            $model->total_doses_discarded = $totalDiscarded;

            // Calculate wastage rate (percentage)
            if ($totalUsed > 0) {
                $model->vaccine_wastage_rate = ($totalDiscarded / $totalUsed) * 100;
            }

            // Count stock outs
            $stockOutCount = 0;
            if (is_array($model->vaccine_utilization)) {
                foreach ($model->vaccine_utilization as $vaccine) {
                    if (isset($vaccine['stock_out']) && $vaccine['stock_out']) {
                        $stockOutCount++;
                    }
                }
            }
            $model->stock_out_count = $stockOutCount;
        });
    }

    /**
     * Get vaccine names list
     */
    public function getVaccineNamesAttribute()
    {
        if (!is_array($this->vaccine_utilization)) {
            return [];
        }

        return array_column($this->vaccine_utilization, 'name');
    }

    /**
     * Get stock out vaccines
     */
    public function getStockOutVaccinesAttribute()
    {
        if (!is_array($this->vaccine_utilization)) {
            return [];
        }

        return array_filter($this->vaccine_utilization, function ($vaccine) {
            return isset($vaccine['stock_out']) && $vaccine['stock_out'];
        });
    }

    /**
     * Get functional devices count
     */
    public function getFunctionalDevicesCountAttribute()
    {
        if (!is_array($this->device_status)) {
            return 0;
        }

        $count = 0;
        foreach ($this->device_status as $device) {
            if (isset($device['functional']) && is_numeric($device['functional'])) {
                $count += (int) $device['functional'];
            }
        }
        return $count;
    }
}