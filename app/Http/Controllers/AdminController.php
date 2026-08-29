<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\ReminderLog;
use App\Models\User;
use App\Models\WahaGroupConfig;
use App\Services\WahaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdmin();

        $users = User::with('pjSubjects:id,name')
            ->orderBy('role')
            ->orderBy('niu')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'niu' => $user->niu,
                'role' => $user->role,
                'practicum_group' => $user->practicum_group,
                'has_pin' => $user->pin_hash !== null,
                'pj_subjects' => $user->pjSubjects->pluck('name')->values()->all(),
            ]);

        $wahaConfigs = WahaGroupConfig::orderBy('id')->get(['id', 'group_name', 'target_group', 'group_jid']);

        $wahaSettings = [
            'waha_base_url' => AppSetting::get('waha_base_url', 'http://localhost:3000'),
            'waha_session' => AppSetting::get('waha_session', 'default'),
            'waha_api_key' => AppSetting::get('waha_api_key'),
        ];

        $recentLogs = ReminderLog::orderByDesc('sent_at')->limit(20)->get()->map(function (ReminderLog $log) {
            return [
                'id' => $log->id,
                'event_type' => $log->event_type,
                'target_group' => $log->target_group,
                'sent_at' => optional($log->sent_at)?->translatedFormat('d M Y, H:i') ?? '-',
                'payload' => $log->payload_snapshot,
            ];
        });

        return Inertia::render('Admin/Index', [
            'users' => $users,
            'wahaConfigs' => $wahaConfigs,
            'wahaSettings' => $wahaSettings,
            'recentLogs' => $recentLogs,
        ]);
    }

    public function fetchWahaGroups(Request $request, WahaService $wahaService): JsonResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'waha_base_url' => ['required', 'url'],
            'waha_session' => ['nullable', 'string', 'max:100'],
            'waha_api_key' => ['nullable', 'string', 'max:255'],
        ]);

        $result = $wahaService->getAvailableGroupsWithParams(
            $validated['waha_base_url'],
            $validated['waha_session'] ?? null,
            $validated['waha_api_key'] ?? null,
        );

        return response()->json($result);
    }

    public function updateWahaSettings(Request $request): JsonResponse|RedirectResponse
    {
        $admin = Auth::user();
        if (! $admin || ! $admin->isAdmin()) {
            abort(403);
        }

        $validated = $request->validate([
            'waha_base_url' => ['required', 'url'],
            'waha_session' => ['required', 'string', 'max:100'],
            'waha_api_key' => ['nullable', 'string', 'max:255'],
            'groups' => ['nullable', 'array'],
            'groups.*.id' => ['required', 'integer', 'exists:waha_group_configs,id'],
            'groups.*.group_jid' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($validated['groups'] ?? [] as $group) {
            WahaGroupConfig::whereKey($group['id'])->update([
                'group_jid' => $group['group_jid'] ?? null,
            ]);
        }

        AppSetting::set('waha_base_url', $validated['waha_base_url']);
        AppSetting::set('waha_session', $validated['waha_session']);
        AppSetting::set('waha_api_key', $validated['waha_api_key'] ?? null);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->back()->with('success', 'Konfigurasi WAHA berhasil disimpan.');
    }

    private function authorizeAdmin(): void
    {
        $admin = Auth::user();

        if (! $admin || ! $admin->isAdmin()) {
            abort(403, 'Akses ditolak.');
        }
    }

    public function resetPin(Request $request): JsonResponse|RedirectResponse
    {
        $admin = Auth::user();
        if (! $admin || ! $admin->isAdmin()) {
            abort(403, 'Hanya Super Admin / Komti yang dapat mereset PIN.');
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        $user->update([
            'pin_hash' => null,
            'is_active' => false,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "PIN akun {$user->name} ({$user->niu}) berhasil direset.",
            ]);
        }

        return redirect()->back()->with('success', "PIN akun {$user->name} ({$user->niu}) berhasil direset.");
    }

    public function testBlast(Request $request, WahaService $wahaService): JsonResponse|RedirectResponse
    {
        $admin = Auth::user();
        if (! $admin || ! $admin->isAdmin()) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'target_group' => ['required', 'in:ALL_THEORY,B1_PRACTICUM,B2_PRACTICUM'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $text = $validated['message'] ?: "🔔 @everyone [TEST NOTIFIKASI PORTAL KELAS]\n\nSistem notifikasi pengingat kuliah dan tugas telah terhubung aktif.";
        $result = $wahaService->blastToTargetGroup($validated['target_group'], $text, 'TEST_BLAST', 0);

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        if ($result['success']) {
            return redirect()->back()->with('success', 'Pesan test blast WhatsApp berhasil dikirim!');
        }

        return redirect()->back()->with('error', 'Gagal mengirim pesan WhatsApp: '.($result['error'] ?? 'Unknown error'));
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'niu' => ['required', 'string', 'max:30', 'unique:users,niu'],
            'name' => ['required', 'string', 'max:100'],
            'role' => ['required', 'in:STUDENT,PJ,ADMIN'],
            'practicum_group' => ['required', 'in:B1,B2'],
        ]);

        User::create($validated);

        return redirect()->back()->with('success', "Mahasiswa {$validated['name']} berhasil ditambahkan.");
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        $validated = $request->validate([
            'niu' => ['required', 'string', 'max:30', 'unique:users,niu,'.$user->id],
            'name' => ['required', 'string', 'max:100'],
            'role' => ['required', 'in:STUDENT,PJ,ADMIN'],
            'practicum_group' => ['required', 'in:B1,B2'],
        ]);

        $user->update($validated);

        return redirect()->back()->with('success', "Data {$validated['name']} berhasil diperbarui.");
    }

    public function deleteUser(User $user): RedirectResponse
    {
        $this->authorizeAdmin();

        if ($user->id === Auth::id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->back()->with('success', "Mahasiswa {$name} berhasil dihapus.");
    }
}
