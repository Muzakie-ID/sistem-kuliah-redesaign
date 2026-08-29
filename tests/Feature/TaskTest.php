<?php

namespace Tests\Feature;

use App\Models\Subject;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_tasks_page_can_be_rendered(): void
    {
        $user = User::create([
            'niu' => '11111',
            'name' => 'Student B1',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->get('/tasks');
        $response->assertStatus(200);
    }

    public function test_user_can_toggle_personal_task_completion(): void
    {
        $user1 = User::create([
            'niu' => '11111',
            'name' => 'Student 1',
            'pin_hash' => Hash::make('123456'),
            'role' => 'STUDENT',
            'practicum_group' => 'B1',
            'is_active' => true,
        ]);

        $user2 = User::create([
            'niu' => '22222',
            'name' => 'Student 2',
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

        $task = Task::create([
            'subject_id' => $subject->id,
            'target_group' => 'ALL_THEORY',
            'title' => 'Tugas 1',
            'deadline' => now()->addDays(2),
        ]);

        // User 1 completes the task
        $response = $this->actingAs($user1)->post("/tasks/{$task->id}/toggle");
        $response->assertSessionHas('success');

        // Check database: user 1 is completed
        $this->assertDatabaseHas('user_task_completions', [
            'user_id' => $user1->id,
            'task_id' => $task->id,
            'is_completed' => true,
        ]);

        // User 2 remains untouched
        $this->assertDatabaseMissing('user_task_completions', [
            'user_id' => $user2->id,
            'task_id' => $task->id,
        ]);

        // User 1 unchecks the task
        $response2 = $this->actingAs($user1)->post("/tasks/{$task->id}/toggle");
        $response2->assertSessionHas('success');

        $this->assertDatabaseHas('user_task_completions', [
            'user_id' => $user1->id,
            'task_id' => $task->id,
            'is_completed' => false,
        ]);
    }
}
