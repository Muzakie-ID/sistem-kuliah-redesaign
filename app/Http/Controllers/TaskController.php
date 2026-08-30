<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\Task;
use App\Models\UserTaskCompletion;
use App\Services\WahaService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $allowedTargets = $user->allowedTargets();

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
                    'subject_id' => $task->subject_id,
                    'subject_name' => $task->subject->name ?? '',
                    'subject_code' => $task->subject->code ?? '',
                    'target_group' => $task->target_group,
                    'title' => $task->title,
                    'description' => $task->description,
                    'deadline' => $task->deadline->toISOString(),
                    'deadline_formatted' => $task->deadline->translatedFormat('d M Y, H:i'),
                    'deadline_human' => $task->deadline->diffForHumans(),
                    'diff_in_hours' => $diffInHours,
                    'submission_url' => $task->submission_url,
                    'submission_format' => $task->submission_format,
                    'is_completed' => $isCompleted,
                    'completed_at' => $completion?->completed_at?->translatedFormat('d M Y, H:i'),
                    'urgency' => $urgency,
                ];
            });

        $pendingTasks = $tasks->filter(fn ($t) => !$t['is_completed'])->values();
        $completedTasks = $tasks->filter(fn ($t) => $t['is_completed'])->values();

        $manageableSubjects = $user->isAdmin()
            ? Subject::all(['id', 'code', 'name', 'type'])
            : $user->pjSubjects()->get(['subjects.id', 'subjects.code', 'subjects.name', 'subjects.type']);

        return Inertia::render('Tasks/Index', [
            'pendingTasks' => $pendingTasks,
            'completedTasks' => $completedTasks,
            'manageableSubjects' => $manageableSubjects,
        ]);
    }

    public function store(Request $request, WahaService $wahaService): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'target_group' => ['required', 'in:BB_THEORY,AA_THEORY,B1_PRACTICUM,B2_PRACTICUM,A1_PRACTICUM,A2_PRACTICUM'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:2000'],
            'deadline' => ['required', 'date'],
            'submission_url' => ['nullable', 'url', 'max:500'],
            'submission_format' => ['nullable', 'string', 'max:50'],
            'send_waha_blast' => ['nullable', 'boolean'],
        ]);

        if (!$user->isPjForSubject($validated['subject_id'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk menambah tugas pada mata kuliah ini.');
        }

        $task = Task::create([
            'subject_id' => $validated['subject_id'],
            'target_group' => $validated['target_group'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'deadline' => $validated['deadline'],
            'submission_url' => $validated['submission_url'] ?? null,
            'submission_format' => $validated['submission_format'] ?? null,
            'created_by' => $user->id,
        ]);

        $blastSent = false;
        if (!empty($validated['send_waha_blast'])) {
            $msg = $wahaService->formatH1TaskReminder($task);
            $wahaService->blastToTargetGroup($task->target_group, $msg, 'H1_TASK', $task->id);
            $blastSent = true;
        }

        return redirect()->back()->with('success', 'Tugas berhasil ditambahkan' . ($blastSent ? ' dan notifikasi WhatsApp terkirim!' : '.'));
    }

    public function toggleComplete(Task $task): RedirectResponse
    {
        $user = Auth::user();

        $completion = UserTaskCompletion::where('user_id', $user->id)
            ->where('task_id', $task->id)
            ->first();

        if ($completion) {
            $completion->update([
                'is_completed' => !$completion->is_completed,
                'completed_at' => !$completion->is_completed ? now() : null,
            ]);
            $statusText = $completion->is_completed ? 'ditandai selesai' : 'dikembalikan ke belum selesai';
        } else {
            UserTaskCompletion::create([
                'user_id' => $user->id,
                'task_id' => $task->id,
                'is_completed' => true,
                'completed_at' => now(),
            ]);
            $statusText = 'ditandai selesai';
        }

        return redirect()->back()->with('success', "Tugas berhasil {$statusText}.");
    }
}
