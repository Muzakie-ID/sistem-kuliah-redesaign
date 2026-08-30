<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'niu',
        'name',
        'pin_hash',
        'role',
        'theory_class',
        'practicum_group',
        'is_active',
    ];

    protected $hidden = [
        'pin_hash',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getAuthPassword(): ?string
    {
        return $this->pin_hash;
    }

    public function coursePjs(): HasMany
    {
        return $this->hasMany(CoursePj::class, 'user_id');
    }

    public function pjSubjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'course_pjs', 'user_id', 'subject_id');
    }

    public function taskCompletions(): HasMany
    {
        return $this->hasMany(UserTaskCompletion::class, 'user_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'ADMIN';
    }

    /**
     * Target group WAHA untuk kelas teori milik user ini (BB_THEORY / AA_THEORY).
     */
    public function theoryTarget(): string
    {
        return $this->theory_class.'_THEORY';
    }

    /**
     * Target group WAHA untuk kloter praktikum milik user ini (B1_PRACTICUM / A2_PRACTICUM / ...).
     */
    public function practicumTarget(): string
    {
        return $this->practicum_group.'_PRACTICUM';
    }

    /**
     * Semua target group jadwal/tugas yang boleh dilihat user ini.
     */
    public function allowedTargets(): array
    {
        return [$this->theoryTarget(), $this->practicumTarget()];
    }

    public function isPj(): bool
    {
        return $this->role === 'PJ' || $this->role === 'ADMIN';
    }

    public function isStudent(): bool
    {
        return $this->role === 'STUDENT';
    }

    public function isPjForSubject(int $subjectId): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->pjSubjects()->where('subjects.id', $subjectId)->exists();
    }
}
