<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'subject',
        'department',
        'ip_address',
        'status',
        'message',
        'resume_path',
    ];
}
