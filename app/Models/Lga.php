<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lga extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code'];

    // ✅ Add numeric casting for ID consistency
    protected $casts = [
        'id' => 'integer',
    ];

    public function wards()
    {
        return $this->hasMany(Ward::class);
    }

    public function phcs()
    {
        return $this->hasMany(Phc::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }
}
