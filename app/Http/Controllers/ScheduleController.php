<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Subject;
use App\Services\WahaService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $practicumTarget = $user->practicum_group === 'B2' ? 'B2_PRACTICUM' : 'B1_PRACTICUM';
        $allowedTargets = ['ALL_THEORY', $practicumTarget];

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Ambil semua jadwal master
        $schedules = Schedule::with('subject')
            ->whereIn('target_group', $allowedTargets)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Ambil overrides minggu ini
        $overrides = ScheduleOverride::with('schedule.subject')
            ->whereBetween('original_date', [$startOfWeek, $endOfWeek])
            ->get()
            ->keyBy('schedule_id');

        $groupedSchedules = [];
        for ($day = 1; $day <= 6; $day++) {
            $groupedSchedules[$day] = [];
        }

        foreach ($schedules as $schedule) {
            $override = $overrides->get($schedule->id);
            $status = $override ? $override->status : 'NORMAL';

            $groupedSchedules[$schedule->day_of_week][] = [
                'id' => $schedule->id,
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject->name ?? '',
                'subject_code' => $schedule->subject->code ?? '',
                'type' => $schedule->subject->type ?? 'THEORY',
                'target_group' => $schedule->target_group,
                'day_of_week' => $schedule->day_of_week,
                'day_name' => $schedule->day_name,
                'start_time' => substr($schedule->start_time, 0, 5),
                'end_time' => substr($schedule->end_time, 0, 5),
                'room' => $schedule->room,
                'lecturer_name' => $schedule->lecturer_name,
                'status' => $status,
                'override' => $override ? [
                    'id' => $override->id,
                    'status' => $override->status,
                    'original_date' => $override->original_date->format('Y-m-d'),
                    'new_date' => $override->new_date?->format('Y-m-d'),
                    'new_start_time' => $override->new_start_time ? substr($override->new_start_time, 0, 5) : null,
                    'new_end_time' => $override->new_end_time ? substr($override->new_end_time, 0, 5) : null,
                    'new_room' => $override->new_room,
                    'meeting_url' => $override->meeting_url,
                    'meeting_passcode' => $override->meeting_passcode,
                    'reason' => $override->reason,
                ] : null,
            ];
        }

        $manageableSubjects = $user->isAdmin()
            ? Subject::all(['id', 'code', 'name', 'type'])
            : $user->pjSubjects()->get(['subjects.id', 'subjects.code', 'subjects.name', 'subjects.type']);

        return Inertia::render('Schedules/Index', [
            'weeklySchedules' => $groupedSchedules,
            'currentDayOfWeek' => Carbon::now()->dayOfWeekIso,
            'manageableSubjects' => $manageableSubjects,
            'allSchedules' => $schedules->map(fn ($s) => [
                'id' => $s->id,
                'subject_id' => $s->subject_id,
                'subject_name' => $s->subject->name ?? '',
                'target_group' => $s->target_group,
                'day_name' => $s->day_name,
                'time_range' => substr($s->start_time, 0, 5) . ' - ' . substr($s->end_time, 0, 5),
            ]),
        ]);
    }

    public function storeOverride(Request $request, WahaService $wahaService): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'schedule_id' => ['required', 'exists:schedules,id'],
            'original_date' => ['required', 'date'],
            'status' => ['required', 'in:NORMAL,RESCHEDULED,MAKEUP_CLASS,CANCELLED,ONLINE'],
            'new_date' => ['nullable', 'date'],
            'new_start_time' => ['nullable', 'date_format:H:i'],
            'new_end_time' => ['nullable', 'date_format:H:i'],
            'new_room' => ['nullable', 'string', 'max:50'],
            'meeting_url' => ['nullable', 'string', 'max:500'],
            'meeting_passcode' => ['nullable', 'string', 'max:50'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'send_waha_blast' => ['nullable', 'boolean'],
        ]);

        $schedule = Schedule::with('subject')->findOrFail($validated['schedule_id']);

        if (!$user->isPjForSubject($schedule->subject_id)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk mengubah jadwal mata kuliah ini.');
        }

        $override = ScheduleOverride::updateOrCreate(
            [
                'schedule_id' => $schedule->id,
                'original_date' => $validated['original_date'],
            ],
            [
                'status' => $validated['status'],
                'new_date' => $validated['new_date'] ?? null,
                'new_start_time' => $validated['new_start_time'] ?? null,
                'new_end_time' => $validated['new_end_time'] ?? null,
                'new_room' => $validated['new_room'] ?? null,
                'meeting_url' => $validated['meeting_url'] ?? null,
                'meeting_passcode' => $validated['meeting_passcode'] ?? null,
                'reason' => $validated['reason'] ?? null,
                'created_by' => $user->id,
            ]
        );

        $blastSent = false;
        if (!empty($validated['send_waha_blast'])) {
            if ($override->status === 'ONLINE') {
                $msg = $wahaService->formatEmergencyOnlineSwitch($schedule, $override);
                $wahaService->blastToTargetGroup($schedule->target_group, $msg, 'EMERGENCY_ONLINE', $override->id);
                $blastSent = true;
            } elseif (in_array($override->status, ['RESCHEDULED', 'MAKEUP_CLASS', 'CANCELLED'])) {
                $msg = $wahaService->formatRescheduleNotice($schedule, $override);
                $wahaService->blastToTargetGroup($schedule->target_group, $msg, 'RESCHEDULE', $override->id);
                $blastSent = true;
            }

            if ($blastSent) {
                $override->update(['is_notified' => true]);
            }
        }

        return redirect()->back()->with('success', 'Status jadwal berhasil diperbarui' . ($blastSent ? ' dan blast WhatsApp telah dikirim!' : '.'));
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->isPj()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses.');
        }

        $validated = $this->validateSchedule($request);

        if (!$user->isPjForSubject($validated['subject_id'])) {
            return redirect()->back()->with('error', 'Anda bukan PJ mata kuliah ini.');
        }

        Schedule::create($validated);

        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan.');
    }

    public function update(Request $request, Schedule $schedule): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->isPjForSubject($schedule->subject_id)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk jadwal ini.');
        }

        $schedule->update($this->validateSchedule($request));

        return redirect()->back()->with('success', 'Jadwal berhasil diperbarui.');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->isPjForSubject($schedule->subject_id)) {
            return redirect()->back()->with('error', 'Anda tidak memiliki hak akses untuk jadwal ini.');
        }

        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal berhasil dihapus.');
    }

    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'target_group' => ['required', 'in:ALL_THEORY,B1_PRACTICUM,B2_PRACTICUM'],
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['required', 'string', 'max:50'],
            'lecturer_name' => ['required', 'string', 'max:100'],
            'meeting_url' => ['nullable', 'string', 'max:500'],
        ]);
    }
}
