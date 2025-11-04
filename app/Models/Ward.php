<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $fillable = ['lga_id', 'name', 'code'];

    // ✅ Add numeric casting for consistent JSON response
    protected $casts = [
        'id' => 'integer',
        'lga_id' => 'integer',
    ];

    public function lga()
    {
        return $this->belongsTo(Lga::class);
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
