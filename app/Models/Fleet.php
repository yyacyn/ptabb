<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fleet extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'fleets';

    protected $fillable = [
        'category_id',
        'ship_name',
        'imo_number',
        'description',
        'build_year',
        'dwt',
        'capacity',
        'status',
        'operational_area',
        'voyage_route_image',
        'ship_particular_pdf',
        'voyage_description',
        'featured_image',
        'flag',
        'deadweight',
        'classification_society',
        'gross_tonnage',
        'net_tonnage',
        'vessel_type',
        'loa',
        'lbp',
        'breadth',
        'depth',
        'speed',
    ];

    public function category()
    {
        return $this->belongsTo(FleetCategory::class, 'category_id');
    }

    public function waypoints()
    {
        return $this->hasMany(VoyageWaypoint::class, 'fleet_id')->orderBy('sequence');
    }
}
