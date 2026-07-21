<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Career extends Model
{
    use HasFactory, SoftDeletes;

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

    /**
     * Get the user who authored this career posting.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
