<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoyageWaypoint extends Model
{
    use HasFactory;

    protected $table = 'voyage_waypoints';

    protected $fillable = [
        'fleet_id',
        'sequence',
        'waypoint_type',
        'port_name',
        'country',
        'latitude',
        'longitude',
        'eta',
        'etd',
        'notes',
        'maritime_route_coordinates',
    ];

    public function fleet()
    {
        return $this->belongsTo(Fleet::class, 'fleet_id');
    }
}
