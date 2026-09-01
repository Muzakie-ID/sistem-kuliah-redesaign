import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { UserPlus, ArrowRight, RefreshCw, AlertCircle, GraduationCap } from 'lucide-react';

export default function Register() {
    const form = useForm({
        niu: '',
        name: '',
        theory_class: 'BB',
        practicum_group: 'B1',
        pin: '',
        pin_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('register.store'));
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
                    Daftar Akun <span className="text-primary-600 dark:text-primary-400">Baru</span>
                </h1>
                <p className="mt-2 text-sm text-ink-soft max-w-xs mx-auto">
                    Registrasi mandiri mahasiswa TRI 2024
                </p>
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
                <div className="bg-card/85 backdrop-blur-xl py-7 px-6 shadow-modal rounded-3xl border border-line">
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label htmlFor="niu" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                Nomor Induk Universitas
                            </label>
                            <input
                                id="niu"
                                type="text"
                                required
                                maxLength={30}
                                placeholder="Contoh: 53412"
                                value={form.data.niu}
                                onChange={(e) => form.setData('niu', e.target.value)}
                                className="w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-ink-faint focus:bg-card focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                maxLength={100}
                                placeholder="Nama mahasiswa"
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                className="w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-sm font-semibold text-ink placeholder:text-ink-faint focus:bg-card focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="theory_class" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                    Kelas Teori
                                </label>
                                <select
                                    id="theory_class"
                                    value={form.data.theory_class}
                                    onChange={(e) => form.setData('theory_class', e.target.value)}
                                    className="w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-sm font-semibold text-ink focus:bg-card focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all"
                                >
                                    <option value="BB">BB</option>
                                    <option value="AA">AA</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="practicum_group" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                    Kloter Praktikum
                                </label>
                                <select
                                    id="practicum_group"
                                    value={form.data.practicum_group}
                                    onChange={(e) => form.setData('practicum_group', e.target.value)}
                                    className="w-full rounded-2xl border border-line bg-elevated px-4 py-3.5 text-sm font-semibold text-ink focus:bg-card focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all"
                                >
                                    <option value="B1">B1</option>
                                    <option value="B2">B2</option>
                                    <option value="A1">A1</option>
                                    <option value="A2">A2</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="pin" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                Buat PIN (6 Digit)
                            </label>
                            <input
                                id="pin"
                                type="password"
                                required
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="••••••"
                                value={form.data.pin}
                                onChange={(e) => form.setData('pin', e.target.value)}
                                className="w-full text-center tracking-[0.6em] font-extrabold rounded-2xl border border-line bg-elevated text-ink px-4 py-3.5 text-lg outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="pin_confirmation" className="block text-[11px] font-bold text-ink-soft uppercase tracking-widest mb-2">
                                Konfirmasi PIN
                            </label>
                            <input
                                id="pin_confirmation"
                                type="password"
                                required
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="••••••"
                                value={form.data.pin_confirmation}
                                onChange={(e) => form.setData('pin_confirmation', e.target.value)}
                                className="w-full text-center tracking-[0.6em] font-extrabold rounded-2xl border border-line bg-elevated text-ink px-4 py-3.5 text-lg outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all"
                            />
                        </div>

                        {form.errors.niu && (
                            <p className="text-xs text-cancelled font-medium flex items-center gap-1.5" role="alert">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{form.errors.niu}</span>
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-sm font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                        >
                            {form.processing ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    Daftar &amp; Masuk
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-5 text-center text-[11px] text-ink-faint">
                    Sudah punya akun? <a href="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">Login di sini</a>
                </p>
            </div>
        </div>
    );
}
