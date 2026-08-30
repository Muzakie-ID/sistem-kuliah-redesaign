import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { KeyRound, ArrowRight, UserCheck, RefreshCw, AlertCircle, GraduationCap } from 'lucide-react';

export default function Login() {
    const [niuInput, setNiuInput] = useState('');
    const [authStep, setAuthStep] = useState('ENTER_NIU'); // 'ENTER_NIU', 'ACTIVATION', 'LOGIN'
    const [detectedUser, setDetectedUser] = useState(null);
    const [checkingNiu, setCheckingNiu] = useState(false);
    const [niuError, setNiuError] = useState('');

    // Form Aktivasi PIN
    const activateForm = useForm({
        niu: '',
        pin: '',
        pin_confirmation: '',
    });

    // Form Login PIN
    const loginForm = useForm({
        niu: '',
        pin: '',
    });

    const handleCheckNiu = async (e) => {
        if (e) e.preventDefault();
        if (!niuInput.trim()) {
            setNiuError('Silakan masukkan NIU Anda.');
            return;
        }

        setCheckingNiu(true);
        setNiuError('');

        try {
            const response = await fetch('/auth/check-niu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ niu: niuInput.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                setNiuError(data.message || 'NIU tidak ditemukan. Hubungi Komti.');
                setCheckingNiu(false);
                return;
            }

            setDetectedUser(data.user);

            if (data.status === 'needs_activation') {
                activateForm.setData('niu', data.user.niu);
                setAuthStep('ACTIVATION');
            } else if (data.status === 'ready_to_login') {
                loginForm.setData('niu', data.user.niu);
                setAuthStep('LOGIN');
            }
        } catch (err) {
            setNiuError('Terjadi kesalahan jaringan. Silakan coba lagi.');
        } finally {
            setCheckingNiu(false);
        }
    };

    const handleActivationSubmit = (e) => {
        e.preventDefault();
        activateForm.post(route('auth.activate'));
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        loginForm.post(route('auth.login'));
    };

    const resetStep = () => {
        setAuthStep('ENTER_NIU');
        setDetectedUser(null);
        setNiuError('');
        activateForm.reset();
        loginForm.reset();
    };

    return (
        <div className="relative min-h-screen bg-surface flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
            {/* Aurora background */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-400/25 blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 -right-28 w-[26rem] h-[26rem] rounded-full bg-purple-300/20 dark:bg-purple-500/15 blur-3xl animate-blob [animation-delay:-5s]"></div>
                <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-sky-200/30 dark:bg-sky-500/10 blur-3xl animate-blob [animation-delay:-9s]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(49_46_129/0.05)_1px,transparent_0)] bg-[size:22px_22px]"></div>
            </div>

            <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.4rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white shadow-btn ring-1 ring-white/40 ring-offset-2 ring-offset-transparent mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-extrabold text-ink tracking-tight leading-tight">
                    Portal Kelas <span className="text-primary-600 dark:text-primary-400">&amp; Praktikum</span> TRI
                </h1>
                <p className="mt-2 text-sm text-ink-soft max-w-xs mx-auto">
                    Pantau Jadwal Kuliah Teori BB/AA, Pecahan Kloter Lab B1/B2 &amp; A1/A2 &amp; Tugas
                </p>
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
                <div className="bg-card/85 backdrop-blur-xl py-7 px-6 shadow-modal rounded-3xl border border-line">
                    {/* STEP 1: INPUT NIU */}
                    {authStep === 'ENTER_NIU' && (
                        <form onSubmit={handleCheckNiu} className="space-y-4">
                            <div>
                                <label htmlFor="niu" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                    Nomor Induk Universitas
                                </label>
                                <input
                                    id="niu"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Contoh: 53412"
                                    value={niuInput}
                                    onChange={(e) => setNiuInput(e.target.value)}
                                    className="w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-ink-faint focus:bg-card focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all"
                                    autoFocus
                                />
                                {niuError && (
                                    <p className="mt-2 text-xs text-cancelled font-medium flex items-center gap-1.5" role="alert">
                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{niuError}</span>
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={checkingNiu}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                            >
                                {checkingNiu ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Memeriksa NIU...
                                    </>
                                ) : (
                                    <>
                                        Lanjutkan
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* STEP 2A: AKTIVASI PIN (AKUN BARU) */}
                    {authStep === 'ACTIVATION' && (
                        <form onSubmit={handleActivationSubmit} className="space-y-4">
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-primary-50/70 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20">
                                <span className="w-9 h-9 rounded-xl bg-primary-600 text-white grid place-items-center shrink-0 shadow-btn">
                                    <UserCheck className="w-4.5 h-4.5" />
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-ink leading-tight">Halo, {detectedUser?.name}!</p>
                                    <p className="text-xs text-primary-700 dark:text-primary-300 font-semibold">
                                        Kelas {detectedUser?.theory_class} • Kloter Praktikum {detectedUser?.practicum_group}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-ink-soft leading-relaxed">
                                Ini adalah login pertama Anda. Buat <strong className="text-ink">6 digit PIN angka</strong> untuk mengamankan akun Anda.
                            </p>

                            <PinField
                                id="new-pin"
                                label="Buat PIN Baru (6 Digit)"
                                value={activateForm.data.pin}
                                onChange={(v) => activateForm.setData('pin', v)}
                                error={activateForm.errors.pin}
                                autoFocus
                            />

                            <PinField
                                id="confirm-pin"
                                label="Konfirmasi PIN"
                                value={activateForm.data.pin_confirmation}
                                onChange={(v) => activateForm.setData('pin_confirmation', v)}
                                error={activateForm.errors.pin_confirmation}
                            />

                            <div className="space-y-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={activateForm.processing}
                                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                                >
                                    {activateForm.processing ? 'Mengaktifkan...' : 'Aktifkan Akun Saya'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetStep}
                                    className="w-full py-2 text-xs font-semibold text-ink-soft hover:text-ink text-center transition-colors"
                                >
                                    Ganti NIU
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 2B: LOGIN PIN (AKUN SUDAH AKTIF) */}
                    {authStep === 'LOGIN' && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-elevated border border-line">
                                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white grid place-items-center font-extrabold text-sm shrink-0 shadow-btn">
                                    {detectedUser?.name?.charAt(0)}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-ink leading-tight">{detectedUser?.name}</p>
                                    <p className="text-xs text-ink-soft">{detectedUser?.niu}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="login-pin" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest">
                                        Masukkan 6 Digit PIN
                                    </label>
                                </div>
                                <PinField
                                    id="login-pin"
                                    value={loginForm.data.pin}
                                    onChange={(v) => loginForm.setData('pin', v)}
                                    error={loginForm.errors.pin}
                                    big
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 pt-1">
                                <button
                                    type="submit"
                                    disabled={loginForm.processing}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                                >
                                    {loginForm.processing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Memverifikasi...
                                        </>
                                    ) : (
                                        <>
                                            Masuk ke Portal
                                            <KeyRound className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetStep}
                                    className="w-full py-2 text-xs font-semibold text-ink-soft hover:text-ink text-center transition-colors"
                                >
                                    Bukan akun Anda? Ganti NIU
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <p className="mt-5 text-center text-[11px] text-ink-faint">
                    Lupa PIN? Hubungi Komti Kelas Anda.
                </p>
            </div>
        </div>
    );
}

function PinField({ id, label, value, onChange, error, autoFocus = false, big = false }) {
    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                    {label}
                </label>
            )}
            <input
                id={id}
                type="password"
                maxLength="6"
                placeholder="••••••"
                inputMode="numeric"
                pattern="[0-9]*"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full text-center tracking-[0.6em] font-extrabold rounded-2xl border border-line bg-elevated text-ink px-4 outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all ${big ? 'py-3.5 text-xl' : 'py-3 text-lg'}`}
                autoFocus={autoFocus}
            />
            {error && (
                <p className="text-xs text-cancelled mt-1.5 font-medium" role="alert">{error}</p>
            )}
        </div>
    );
}
