<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// ponytail: register sementara untuk input data mahasiswa manual, hapus saat ada integrasi data kampus
class RegisterController extends Controller
{
    public function create()
    {
        if (auth()->check()) {
            return redirect()->route('dashboard');
        }

        return inertia('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'niu' => ['required', 'string', 'max:30', 'unique:users,niu'],
            'name' => ['required', 'string', 'max:100'],
            'theory_class' => ['required', 'in:BB,AA'],
            'practicum_group' => ['required', 'in:B1,B2,A1,A2'],
            'pin' => ['required', 'string', 'regex:/^[0-9]{6}$/', 'confirmed'],
        ], [
            'pin.regex' => 'PIN harus berupa 6 digit angka.',
            'pin.confirmed' => 'Konfirmasi PIN tidak cocok.',
            'niu.unique' => 'NIU sudah terdaftar.',
        ]);

        $user = User::create([
            ...$validated,
            'pin_hash' => Hash::make($validated['pin']),
            'is_active' => true,
            'role' => 'STUDENT',
        ]);

        auth()->login($user, true);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', "Akun {$user->name} berhasil dibuat. Selamat datang!");
    }
}
