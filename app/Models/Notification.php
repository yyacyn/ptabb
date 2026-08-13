<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model {
    use HasFactory;

    protected $fillable = [
        'title',
        'type',
        'content',
        'image',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope query to get notifications that are active or scheduled for today.
     */
    public function scopeActiveOrScheduled($query)
    {
        $today = now()->toDateString();
        return $query->where(function ($q) use ($today) {
            $q->where('status', 'active')
              ->orWhere(function ($sq) use ($today) {
                  $sq->where('status', 'scheduled')
                     ->whereNotNull('start_date')
                     ->whereNotNull('end_date')
                     ->where('start_date', '<=', $today)
                     ->where('end_date', '>=', $today);
              });
        });
    }
}