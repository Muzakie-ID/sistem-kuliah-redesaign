<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    public function checkNiu(Request $request): JsonResponse
    {
        $request->validate([
            'niu' => ['required', 'string', 'max:50'],
        ]);

        $niu = trim($request->input('niu'));
        $user = User::where('niu', $niu)->first();

        if (!$user) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'NIU tidak terdaftar. Hubungi Komti Kelas.',
            ], 404);
        }

        if (empty($user->pin_hash) || !$user->is_active) {
            return response()->json([
                'status' => 'needs_activation',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'niu' => $user->niu,
                    'role' => $user->role,
                    'practicum_group' => $user->practicum_group,
                ],
            ]);
        }

        return response()->json([
            'status' => 'ready_to_login',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'niu' => $user->niu,
                'role' => $user->role,
                'practicum_group' => $user->practicum_group,
            ],
        ]);
    }

    public function activatePin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'niu' => ['required', 'string', 'exists:users,niu'],
            'pin' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
            'pin_confirmation' => ['required', 'same:pin'],
        ], [
            'pin.regex' => 'PIN harus berupa 6 digit angka.',
            'pin_confirmation.same' => 'Konfirmasi PIN tidak cocok.',
        ]);

        $user = User::where('niu', $validated['niu'])->firstOrFail();

        $user->update([
            'pin_hash' => Hash::make($validated['pin']),
            'is_active' => true,
        ]);

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'))
            ->with('success', 'Akun berhasil diaktifkan! Selamat datang.');
    }

    public function login(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'niu' => ['required', 'string', 'exists:users,niu'],
            'pin' => ['required', 'string', 'regex:/^[0-9]{6}$/'],
        ], [
            'pin.regex' => 'PIN harus terdiri dari 6 digit angka.',
        ]);

        $user = User::where('niu', $validated['niu'])->first();

        if (!$user || empty($user->pin_hash) || !Hash::check($validated['pin'], $user->pin_hash)) {
            throw ValidationException::withMessages([
                'pin' => 'PIN yang Anda masukkan salah.',
            ]);
        }

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
