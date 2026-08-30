<?php

namespace Tests\Feature;

use App\Models\CoursePj;
use App\Models\Schedule;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_displays_today_schedules_for_student(): void
    {
        $student = User::create([
            'niu' => '11111',
            'name' => 'Student B1',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $subject = Subject::create([
            'code' => 'TRI201',
            'name' => 'Pemrograman Web Lanjut',
            'type' => 'THEORY',
        ]);

        $todayIso = now()->dayOfWeekIso;

        Schedule::create([
            'subject_id' => $subject->id,
            'target_group' => 'BB_THEORY',
            'day_of_week' => $todayIso,
            'start_time' => '08:00:00',
            'end_time' => '09:40:00',
            'room' => 'Ruang 201',
            'lecturer_name' => 'Pak Budi',
        ]);

        $response = $this->actingAs($student)->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_pj_can_create_emergency_online_override(): void
    {
        $pj = User::create([
            'niu' => '22222',
            'name' => 'PJ Web',
            'pin_hash' => Hash::make('123456'),
            'role' => 'PJ',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $subject = Subject::create([
            'code' => 'TRI201',
            'name' => 'Pemrograman Web Lanjut',
            'type' => 'THEORY',
        ]);

        CoursePj::create([
            'user_id' => $pj->id,
            'subject_id' => $subject->id,
        ]);

        $schedule = Schedule::create([
            'subject_id' => $subject->id,
            'target_group' => 'BB_THEORY',
            'day_of_week' => 1,
            'start_time' => '08:00:00',
            'end_time' => '09:40:00',
            'room' => 'Ruang 201',
            'lecturer_name' => 'Pak Budi',
        ]);

        $response = $this->actingAs($pj)->post('/schedules/override', [
            'schedule_id' => $schedule->id,
            'original_date' => now()->format('Y-m-d'),
            'status' => 'ONLINE',
            'meeting_url' => 'https://zoom.us/j/123456',
            'meeting_passcode' => '123456',
            'reason' => 'Dosen ke luar kota',
            'send_waha_blast' => false,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('schedule_overrides', [
            'schedule_id' => $schedule->id,
            'status' => 'ONLINE',
            'meeting_url' => 'https://zoom.us/j/123456',
        ]);
    }

    public function test_unauthorized_user_cannot_override_schedule(): void
    {
        $student = User::create([
            'niu' => '33333',
            'name' => 'Regular Student',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $subject = Subject::create([
            'code' => 'TRI201',
            'name' => 'Pemrograman Web Lanjut',
            'type' => 'THEORY',
        ]);

        $schedule = Schedule::create([
            'subject_id' => $subject->id,
            'target_group' => 'BB_THEORY',
            'day_of_week' => 1,
            'start_time' => '08:00:00',
            'end_time' => '09:40:00',
            'room' => 'Ruang 201',
            'lecturer_name' => 'Pak Budi',
        ]);

        $response = $this->actingAs($student)->post('/schedules/override', [
            'schedule_id' => $schedule->id,
            'original_date' => now()->format('Y-m-d'),
            'status' => 'ONLINE',
            'meeting_url' => 'https://zoom.us/j/123456',
            'send_waha_blast' => false,
        ]);

        $response->assertSessionHas('error');
    }
}
