<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Careers extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'careers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'author_id',
        'author_name',
        'author_role',
        'position',
        'department',
        'category',
        'location',
        'employment_type',
        'description',
        'requirements',
        'responsibilities',
        'status',
        'application_deadline',
    ];
}
