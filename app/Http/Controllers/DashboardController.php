<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Subject;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $today = Carbon::today();
        $dayOfWeek = $today->dayOfWeekIso; // 1 (Mon) to 7 (Sun)

        $practicumTarget = $user->practicum_group === 'B2' ? 'B2_PRACTICUM' : 'B1_PRACTICUM';
        $allowedTargets = ['ALL_THEORY', $practicumTarget];

        // 1. Ambil Jadwal Master untuk Hari Ini
        $masterSchedules = Schedule::with(['subject'])
            ->whereIn('target_group', $allowedTargets)
            ->where('day_of_week', $dayOfWeek)
            ->orderBy('start_time')
            ->get();

        // 2. Ambil Overrides untuk Hari Ini
        $overrides = ScheduleOverride::with(['schedule.subject', 'creator'])
            ->where(function ($query) use ($today) {
                $query->whereDate('original_date', $today)
                    ->orWhereDate('new_date', $today);
            })
            ->get()
            ->keyBy('schedule_id');

        // 3. Gabungkan Jadwal dengan Overrides
        $todaySchedules = $masterSchedules->map(function ($schedule) use ($overrides, $today) {
            $override = $overrides->get($schedule->id);

            $status = 'NORMAL';
            $displayStartTime = substr($schedule->start_time, 0, 5);
            $displayEndTime = substr($schedule->end_time, 0, 5);
            $displayRoom = $schedule->room;
            $meetingUrl = $schedule->meeting_url;
            $meetingPasscode = null;
            $reason = null;

            if ($override) {
                $status = $override->status;
                $meetingUrl = $override->meeting_url;
                $meetingPasscode = $override->meeting_passcode;
                $reason = $override->reason;

                if ($override->new_start_time) {
                    $displayStartTime = substr($override->new_start_time, 0, 5);
                }
                if ($override->new_end_time) {
                    $displayEndTime = substr($override->new_end_time, 0, 5);
                }
                if ($override->new_room) {
                    $displayRoom = $override->new_room;
                }
            }

            return [
                'id' => $schedule->id,
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject->name ?? 'Mata Kuliah',
                'subject_code' => $schedule->subject->code ?? '',
                'type' => $schedule->subject->type ?? 'THEORY',
                'target_group' => $schedule->target_group,
                'start_time' => $displayStartTime,
                'end_time' => $displayEndTime,
                'original_start_time' => substr($schedule->start_time, 0, 5),
                'original_end_time' => substr($schedule->end_time, 0, 5),
                'room' => $displayRoom,
                'original_room' => $schedule->room,
                'lecturer_name' => $schedule->lecturer_name,
                'status' => $status,
                'meeting_url' => $meetingUrl,
                'meeting_passcode' => $meetingPasscode,
                'reason' => $reason,
                'override' => $override,
            ];
        });

        // 4. Ambil Tugas Prioritas (Deadline terdekat)
        $tasks = Task::with(['subject', 'completions' => function ($q) use ($user) {
            $q->where('user_id', $user->id);
        }])
            ->whereIn('target_group', $allowedTargets)
            ->orderBy('deadline', 'asc')
            ->get()
            ->map(function ($task) use ($user) {
                $completion = $task->completions->first();
                $isCompleted = $completion ? $completion->is_completed : false;

                $diffInHours = Carbon::now()->diffInHours($task->deadline, false);
                $diffInDays = Carbon::now()->diffInDays($task->deadline, false);

                $urgency = 'safe'; // green
                if ($diffInHours <= 24) {
                    $urgency = 'urgent'; // red
                } elseif ($diffInDays <= 3) {
                    $urgency = 'warning'; // yellow
                }

                return [
                    'id' => $task->id,
                    'subject_name' => $task->subject->name ?? '',
                    'target_group' => $task->target_group,
                    'title' => $task->title,
                    'description' => $task->description,
                    'deadline' => $task->deadline->toISOString(),
                    'deadline_formatted' => $task->deadline->translatedFormat('d M Y, H:i'),
                    'deadline_human' => $task->deadline->diffForHumans(),
                    'submission_url' => $task->submission_url,
                    'submission_format' => $task->submission_format,
                    'is_completed' => $isCompleted,
                    'urgency' => $urgency,
                ];
            });

        // Matkul ampuan untuk PJ/Admin
        $manageableSubjects = $user->isAdmin()
            ? Subject::all(['id', 'code', 'name', 'type'])
            : $user->pjSubjects()->get(['subjects.id', 'subjects.code', 'subjects.name', 'subjects.type']);

        return Inertia::render('Dashboard/Index', [
            'todaySchedules' => $todaySchedules,
            'priorityTasks' => $tasks->take(5),
            'manageableSubjects' => $manageableSubjects,
            'todayDateFormatted' => $today->translatedFormat('l, d F Y'),
        ]);
    }
}
