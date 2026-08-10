<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';

    protected $fillable = [
        'name',
        'category',
        'country',
        'logo',
    ];

    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute()
    {
        if (empty($this->logo)) {
            return '/images/clients/placeholder.png';
        }

        if (str_starts_with($this->logo, 'http://') || str_starts_with($this->logo, 'https://')) {
            return $this->logo;
        }

        if (str_starts_with($this->logo, '/storage/') || str_starts_with($this->logo, '/images/')) {
            return $this->logo;
        }

        if (str_starts_with($this->logo, 'storage/') || str_starts_with($this->logo, 'images/')) {
            return '/' . $this->logo;
        }

        return '/images/clients/' . basename($this->logo);
    }
}

