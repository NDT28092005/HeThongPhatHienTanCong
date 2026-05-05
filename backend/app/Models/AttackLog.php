<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttackLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'url',
        'method',
        'model_used',
        'confidence',
        'user_agent',
    ];
}
