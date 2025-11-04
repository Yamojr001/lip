<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Phc extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_name',
        'lga_id',
        'ward_id',
        'address',
        'email',
        'contact_phone',
        'incharge_name',
        'anc_schedule',
        'images',
    ];

    // ✅ Add numeric casting for IDs + retain your existing array casts
    protected $casts = [
        'id' => 'integer',
        'lga_id' => 'integer',
        'ward_id' => 'integer',
        'anc_schedule' => 'array',
        'images' => 'array',
    ];

    public function lga()
    {
        return $this->belongsTo(Lga::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }
}
