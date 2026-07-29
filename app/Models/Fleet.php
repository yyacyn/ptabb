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
        'light_ship',
        'summer_draft',
        'port_of_registry',
        'call_sign',
        'mmsi',
        'hull_no',
        'vessel_type',
        'loa',
        'lbp',
        'breadth',
        'depth',
        'speed',
        'particulars_data',
    ];

    protected $casts = [
        'particulars_data' => 'array',
    ];

    protected $appends = ['featured_image_url'];

    public function getFeaturedImageUrlAttribute()
    {
        if (!$this->featured_image) {
            return '/images/card_bulk_vessel.png';
        }

        if (str_starts_with($this->featured_image, 'http') || str_starts_with($this->featured_image, '/')) {
            return $this->featured_image;
        }

        // First check static assets /images/fleet/
        if (file_exists(public_path('images/fleet/' . $this->featured_image))) {
            return '/images/fleet/' . $this->featured_image;
        }

        // Fallback to uploaded storage/fleets/
        return '/storage/fleets/' . $this->featured_image;
    }

    public function category()
    {
        return $this->belongsTo(FleetCategory::class, 'category_id');
    }

    public function waypoints()
    {
        return $this->hasMany(VoyageWaypoint::class, 'fleet_id')->orderBy('sequence');
    }
}
