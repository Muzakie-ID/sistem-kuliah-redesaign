<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleOverride;
use App\Models\Subject;
use App\Services\WahaService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $allowedTargets = $user->allowedTargets();

        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        // Ambil semua jadwal master
        $schedules = Schedule::with('subject')
            ->whereIn('target_group', $allowedTargets)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        // Ambil overrides minggu ini: perubahan pertemuan minggu ini ATAU kelas pengganti yang jatuh minggu ini
        $overrides = ScheduleOverride::with('schedule.subject')
            ->where(function ($q) use ($startOfWeek, $endOfWeek) {
                $q->whereBetween('original_date', [$startOfWeek, $endOfWeek])
                  ->orWhereBetween('new_date', [$startOfWeek, $endOfWeek]);
            })
            ->get();

        // Perubahan pertemuan minggu ini → menempel ke kartu master
        $overridesBySchedule = $overrides
            ->filter(fn ($o) => $o->original_date->between($startOfWeek, $endOfWeek))
            ->keyBy('schedule_id');

        // Kelas pengganti yang jatuh minggu ini → kartu tambahan di hari tujuan
        $makeupOverrides = $overrides->filter(
            fn ($o) => $o->new_date && $o->new_date->between($startOfWeek, $endOfWeek)
        );

        $groupedSchedules = [];
        $makeupSchedules = [];
        for ($day = 1; $day <= 6; $day++) {
            $groupedSchedules[$day] = [];
            $makeupSchedules[$day] = [];
        }

        foreach ($schedules as $schedule) {
            $override = $overridesBySchedule->get($schedule->id);
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
                'description' => $schedule->description,
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

        // Kartu kelas pengganti di hari tujuan (new_date) minggu ini
        foreach ($makeupOverrides as $makeup) {
            $schedule = $makeup->schedule;
            if (!$schedule) {
                continue;
            }

            $day = $makeup->new_date->dayOfWeekIso;
            if ($day < 1 || $day > 6) {
                continue;
            }

            $makeupSchedules[$day][] = [
                'id' => $schedule->id,
                'is_makeup' => true,
                'subject_id' => $schedule->subject_id,
                'subject_name' => $schedule->subject->name ?? '',
                'subject_code' => $schedule->subject->code ?? '',
                'type' => $schedule->subject->type ?? 'THEORY',
                'target_group' => $schedule->target_group,
                'day_of_week' => $day,
                'day_name' => $schedule->day_name,
                'start_time' => $makeup->new_start_time ? substr($makeup->new_start_time, 0, 5) : substr($schedule->start_time, 0, 5),
                'end_time' => $makeup->new_end_time ? substr($makeup->new_end_time, 0, 5) : substr($schedule->end_time, 0, 5),
                'room' => $makeup->new_room ?? $schedule->room,
                'lecturer_name' => $schedule->lecturer_name,
                'description' => $schedule->description,
                'status' => $makeup->status,
                'override' => [
                    'id' => $makeup->id,
                    'status' => $makeup->status,
                    'original_date' => $makeup->original_date->format('Y-m-d'),
                    'new_date' => $makeup->new_date->format('Y-m-d'),
                    'new_start_time' => $makeup->new_start_time ? substr($makeup->new_start_time, 0, 5) : null,
                    'new_end_time' => $makeup->new_end_time ? substr($makeup->new_end_time, 0, 5) : null,
                    'new_room' => $makeup->new_room,
                    'meeting_url' => $makeup->meeting_url,
                    'meeting_passcode' => $makeup->meeting_passcode,
                    'reason' => $makeup->reason,
                ],
            ];
        }

        // Urutkan kartu pengganti per hari berdasarkan jam mulai
        foreach ($makeupSchedules as $day => $items) {
            usort($items, fn ($a, $b) => strcmp($a['start_time'], $b['start_time']));
            $makeupSchedules[$day] = $items;
        }

        $manageableSubjects = $user->isAdmin()
            ? Subject::all(['id', 'code', 'name', 'type'])
            : $user->pjSubjects()->get(['subjects.id', 'subjects.code', 'subjects.name', 'subjects.type']);

        return Inertia::render('Schedules/Index', [
            'weeklySchedules' => $groupedSchedules,
            'makeupSchedules' => $makeupSchedules,
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

        if ($error = $this->overlapError($validated)) {
            throw ValidationException::withMessages(['start_time' => $error]);
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

        if ($error = $this->overlapError($this->validateSchedule($request), $schedule->id)) {
            throw ValidationException::withMessages(['start_time' => $error]);
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

    /**
     * Tolak jika ada jadwal lain di kelas (target_group) & hari yang sama dengan jam tumpang tindih.
     * ponytail: cek bentrok hanya per target_group; cek bentrok ruangan/dosen bisa ditambah nanti bila perlu.
     */
    private function overlapError(array $data, ?int $ignoreId = null): ?string
    {
        $overlap = Schedule::where('target_group', $data['target_group'])
            ->where('day_of_week', $data['day_of_week'])
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->first();

        if (!$overlap) {
            return null;
        }

        $dayNames = [1 => 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

        return sprintf(
            'Bentrok dengan jadwal %s (%s, %s-%s, %s).',
            $overlap->subject->name ?? 'mata kuliah lain',
            $dayNames[$data['day_of_week']] ?? '-',
            substr($overlap->start_time, 0, 5),
            substr($overlap->end_time, 0, 5),
            $overlap->room,
        );
    }

    private function validateSchedule(Request $request): array
    {
        return $request->validate([
            'subject_id' => ['required', 'exists:subjects,id'],
            'target_group' => ['required', 'in:BB_THEORY,AA_THEORY,B1_PRACTICUM,B2_PRACTICUM,A1_PRACTICUM,A2_PRACTICUM'],
            'day_of_week' => ['required', 'integer', 'min:1', 'max:7'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'room' => ['required', 'string', 'max:50'],
            'lecturer_name' => ['required', 'string', 'max:100'],
            'meeting_url' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);
    }
}
