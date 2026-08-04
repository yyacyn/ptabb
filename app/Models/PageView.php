<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PageView extends Model
{
    use HasFactory;

    protected $fillable = [
        'page_url',
        'route_name',
        'view_date',
        'view_count',
        'unique_visitors',
    ];

    protected $casts = [
        'view_date' => 'date',
        'view_count' => 'integer',
        'unique_visitors' => 'integer',
    ];
}
