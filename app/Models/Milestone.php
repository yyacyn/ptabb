<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Milestone extends Model
{
    protected $fillable = [
        'year',
        'milestone',
        'description',
        'image',
    ];
}
