<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class News extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'category_id',
        'slug',
        'excerpt',
        'featured_image',
        'content',
        'youtube_url',
        'view_count',
        'status',
        'published_at',
        'meta_title',
        'meta_description',
        'author',
    ];

    public function category()
    {
        return $this->belongsTo(NewsCategory::class, 'category_id');
    }
}