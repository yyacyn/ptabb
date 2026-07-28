<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'username', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isHrAdmin(): bool
    {
        return $this->role === 'hr_admin';
    }

    public function isCrewAdmin(): bool
    {
        return $this->role === 'crew_admin';
    }

    public function isPrAdmin(): bool
    {
        return $this->role === 'pr_admin';
    }

    public function canAccessModule(string $module): bool
    {
        return match ($this->role) {
            'super_admin' => true,
            'hr_admin' => in_array($module, ['dashboard', 'careers', 'notifications']),
            'crew_admin' => in_array($module, ['dashboard', 'careers']),
            'pr_admin' => in_array($module, ['dashboard', 'news', 'clients']),
            default => false,
        };
    }
}
