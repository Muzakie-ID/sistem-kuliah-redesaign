import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Badge from '../../Components/Badge';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { 
    Users, KeyRound, Send, History, ShieldAlert, 
    CheckCircle2, AlertCircle, RefreshCw, Search,
    Settings, Save, Globe, Key, Layers, DownloadCloud, Bot,
    UserPlus, Pencil, Trash2, X, BookOpen, BookPlus
} from 'lucide-react';

export default function AdminIndex({ users = [], subjects = [], wahaConfigs = [], wahaSettings = {}, recentLogs = [] }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('USERS'); // 'USERS', 'SUBJECTS', 'WAHA', 'LOGS'
    const [fetchedGroups, setFetchedGroups] = useState([]);
    const [fetchingGroups, setFetchingGroups] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [blastResult, setBlastResult] = useState(null);
    const [configSaveSuccess, setConfigSaveSuccess] = useState(false);
    const [userModal, setUserModal] = useState(null); // null | {mode:'create'} | {mode:'edit', user}
    const [subjectModal, setSubjectModal] = useState(null); // null | {mode:'create'} | {mode:'edit', subject}
    const [confirmDialog, setConfirmDialog] = useState(null); // null | { title, message, confirmLabel, action }

    // Form Konfigurasi Server WAHA & JID Grup
    const configForm = useForm({
        waha_base_url: wahaSettings.waha_base_url || 'http://localhost:3000',
        waha_session: wahaSettings.waha_session || 'default',
        waha_api_key: wahaSettings.waha_api_key || '',
        groups: wahaConfigs.map(c => ({
            id: c.id,
            group_name: c.group_name,
            target_group: c.target_group,
            group_jid: c.group_jid,
        })),
    });

    // Form Test Blast
    const testBlastForm = useForm({
        target_group: 'BB_THEORY',
        message: '',
    });

    const handleResetPin = (userId, userName) => {
        setConfirmDialog({
            title: 'Reset PIN',
            message: `Apakah Anda yakin ingin mereset PIN untuk ${userName}? Akun akan dikembalikan ke status belum aktif agar mahasiswa dapat membuat PIN baru.`,
            confirmLabel: 'Ya, Reset PIN',
            action: () => router.post(route('admin.users.reset-pin'), { user_id: userId }, { preserveScroll: true }),
        });
    };

    const handleSaveConfigSubmit = (e) => {
        e.preventDefault();
        setConfigSaveSuccess(false);
        configForm.post(route('admin.waha.settings'), {
            preserveScroll: true,
            onSuccess: () => {
                setConfigSaveSuccess(true);
                setTimeout(() => setConfigSaveSuccess(false), 4000);
            },
        });
    };

    const handleTestBlastSubmit = (e) => {
        e.preventDefault();
        setBlastResult(null);
        testBlastForm.post(route('admin.waha.test-blast'), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash;
                if (flash?.error) {
                    setBlastResult({ success: false, message: flash.error });
                } else {
                    setBlastResult({ 
                        success: true, 
                        message: flash?.success || 'Pesan test blast WhatsApp berhasil dikirim ke grup!' 
                    });
                    testBlastForm.reset('message');
                }
            },
            onError: (errors) => {
                setBlastResult({ 
                    success: false, 
                    message: Object.values(errors).flat().join(', ') || 'Terjadi kesalahan saat mengirim blast.' 
                });
            },
        });
    };

    const handleGroupJidChange = (index, value) => {
        const updated = [...configForm.data.groups];
        updated[index].group_jid = value;
        configForm.setData('groups', updated);
    };

    const assignFetchedJid = (targetGroup, jid) => {
        const updated = configForm.data.groups.map(g => {
            if (g.target_group === targetGroup) {
                return { ...g, group_jid: jid };
            }
            return g;
        });
        configForm.setData('groups', updated);
    };

    const handleFetchWahaGroups = async () => {
        setFetchingGroups(true);
        setFetchError('');
        setFetchedGroups([]);

        try {
            const params = new URLSearchParams({
                waha_base_url: configForm.data.waha_base_url,
                waha_session: configForm.data.waha_session,
                waha_api_key: configForm.data.waha_api_key || '',
            });

            const url = `${route('admin.waha.groups')}?${params.toString()}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            const data = await res.json();

            if (data.success && data.groups) {
                setFetchedGroups(data.groups);
                if (data.groups.length === 0) {
                    setFetchError('Tidak ada grup WhatsApp yang ditemukan pada session ini.');
                }
            } else {
                setFetchError(data.error || 'Gagal terhubung ke WAHA. Periksa URL, Session, atau API Key.');
            }
        } catch (err) {
            setFetchError('Koneksi ke server WAHA gagal: ' + err.message);
        } finally {
            setFetchingGroups(false);
        }
    };

    const filteredUsers = users.filter((u) => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.niu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout>
            <Head title="Admin Panel & Manajemen Kelas" />

            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-rose-50 dark:from-slate-900 dark:via-slate-950 dark:to-rose-950 border border-line p-5 mb-5 shadow-card animate-fade-in-up">
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-rose-500/20 blur-2xl"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.06)_1px,transparent_0)] bg-[size:18px_18px]"></div>
                </div>
                <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                        <ShieldAlert className="w-3 h-3" />
                        Panel Khusus Komti
                    </span>
                    <h2 className="text-xl font-extrabold text-ink tracking-tight dark:text-white">Kontrol Sistem &amp; WhatsApp Gateway</h2>
                    <p className="text-xs text-ink-soft mt-1 dark:text-white/60">Kelola akun mahasiswa, reset PIN, dan konfigurasi bot WhatsApp</p>
                </div>
            </div>

            {/* Navigation Section Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-elevated p-1.5 rounded-2xl mb-6 text-xs font-bold" role="tablist" aria-label="Bagian admin">
                <AdminTab active={activeSection === 'USERS'} onClick={() => setActiveSection('USERS')} icon={<Users className="w-4 h-4" />} label={`Mahasiswa (${users.length})`} />
                <AdminTab active={activeSection === 'SUBJECTS'} onClick={() => setActiveSection('SUBJECTS')} icon={<BookOpen className="w-4 h-4" />} label={`Mapel (${subjects.length})`} />
                <AdminTab active={activeSection === 'WAHA'} onClick={() => setActiveSection('WAHA')} icon={<Bot className="w-4 h-4" />} label="WhatsApp Bot" />
                <AdminTab active={activeSection === 'LOGS'} onClick={() => setActiveSection('LOGS')} icon={<History className="w-4 h-4" />} label="Log Blast" />
            </div>

            {/* SECTION 1: MANAJEMEN MAHASISWA & RESET PIN */}
            {activeSection === 'USERS' && (
                <section className="space-y-3 animate-fade-in-up">
                    {/* Search Input */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="search"
                                aria-label="Cari mahasiswa"
                                placeholder="Cari nama, NIU, atau role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-card rounded-full border border-line text-xs text-ink placeholder:text-ink-faint focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 outline-none transition-all shadow-card"
                            />
                        </div>
                        <button
                            onClick={() => setUserModal({ mode: 'create', form: { niu: '', name: '', role: 'STUDENT', theory_class: 'BB', practicum_group: 'B1' } })}
                            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold shadow-btn transition-all active:scale-95"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Tambah</span>
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {filteredUsers.map((u) => (
                            <article
                                key={u.id}
                                className="bg-card rounded-2xl p-4 border border-line shadow-card flex items-center justify-between gap-3 transition-all hover:shadow-card-hover"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`shrink-0 grid place-items-center w-10 h-10 rounded-2xl font-extrabold text-sm ring-1 ring-line ${
                                        u.role === 'ADMIN'
                                            ? 'bg-cancelled-bg text-cancelled'
                                            : u.role === 'PJ'
                                            ? 'bg-online-bg text-online'
                                            : 'bg-elevated text-ink-soft'
                                    }`}>
                                        {u.name.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap gap-y-1 mb-0.5">
                                            <h4 className="font-extrabold text-ink text-sm truncate">{u.name}</h4>
                                            {u.role === 'ADMIN' && <Badge variant="admin">Komti</Badge>}
                                            {u.role === 'PJ' && <Badge variant="pj">PJ</Badge>}
                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line text-ink-faint shrink-0">Kloter {u.practicum_group}</span>
                                        </div>
                                        <p className="text-xs text-ink-soft font-medium">{u.niu}</p>
                                        <div className="mt-1 flex items-center gap-2 text-[11px] flex-wrap">
                                            <span className={`inline-flex items-center gap-1.5 font-bold ${u.has_pin ? 'text-safe' : 'text-rescheduled'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${u.has_pin ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                                {u.has_pin ? 'PIN Aktif' : 'Belum Buat PIN'}
                                            </span>
                                            {u.pj_subjects.length > 0 && (
                                                <span className="text-ink-faint truncate">• PJ: {u.pj_subjects.join(', ')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5">
                                    <button
                                        onClick={() => setUserModal({ mode: 'edit', user: u, form: { niu: u.niu, name: u.name, role: u.role, theory_class: u.theory_class, practicum_group: u.practicum_group } })}
                                        className="grid place-items-center w-9 h-9 rounded-xl bg-elevated hover:bg-primary-50 dark:hover:bg-primary-500/15 text-ink-soft hover:text-primary-600 dark:hover:text-primary-400 border border-line transition-colors active:scale-95"
                                        title={`Edit data ${u.name}`}
                                        aria-label={`Edit ${u.name}`}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    {u.has_pin ? (
                                        <button
                                            onClick={() => handleResetPin(u.id, u.name)}
                                            className="inline-flex items-center gap-1 px-3 py-2 bg-cancelled-bg hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-cancelled-line transition-colors active:scale-95"
                                            title={`Reset PIN milik ${u.name}`}
                                        >
                                            <KeyRound className="w-3.5 h-3.5" />
                                            Reset PIN
                                        </button>
                                    ) : (
                                        <span className="text-[11px] text-ink-faint italic">Siap Aktivasi</span>
                                    )}
                                    <button
                                        onClick={() => setConfirmDialog({
                                            title: 'Hapus Akun',
                                            message: `Hapus akun ${u.name} (${u.niu})? Tindakan ini tidak dapat dibatalkan.`,
                                            confirmLabel: 'Ya, Hapus',
                                            action: () => router.delete(route('admin.users.destroy', u.id), { preserveScroll: true }),
                                        })}
                                        className="grid place-items-center w-9 h-9 rounded-xl bg-elevated hover:bg-rose-50 dark:hover:bg-rose-500/15 text-ink-soft hover:text-cancelled border border-line transition-colors active:scale-95"
                                        title={`Hapus ${u.name}`}
                                        aria-label={`Hapus ${u.name}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-center text-xs text-ink-faint py-6">Tidak ada mahasiswa yang cocok dengan pencarian.</p>
                        )}
                    </div>
                </section>
            )}

            {/* SECTION 2: MANAJEMEN MATA PELAJARAN */}
            {activeSection === 'SUBJECTS' && (
                <section className="space-y-3 animate-fade-in-up">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setSubjectModal({ mode: 'create', form: { code: '', name: '', type: 'THEORY' } })}
                            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold shadow-btn transition-all active:scale-95"
                        >
                            <BookPlus className="w-4 h-4" />
                            Tambah Mapel
                        </button>
                    </div>

                    <div className="space-y-2.5">
                        {subjects.map((s) => (
                            <article
                                key={s.id}
                                className="bg-card rounded-2xl p-4 border border-line shadow-card flex items-center justify-between gap-3 transition-all hover:shadow-card-hover"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`shrink-0 grid place-items-center w-10 h-10 rounded-2xl font-extrabold text-xs ring-1 ring-line ${
                                        s.type === 'PRACTICUM' ? 'bg-online-bg text-online' : 'bg-elevated text-ink-soft'
                                    }`}>
                                        {s.code}
                                    </span>
                                    <div className="min-w-0">
                                        <h4 className="font-extrabold text-ink text-sm truncate">{s.name}</h4>
                                        <p className="text-xs text-ink-soft font-medium">
                                            {s.type === 'PRACTICUM' ? 'Praktikum' : 'Teori'} • {s.schedules_count} jadwal • {s.tasks_count} tugas
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5">
                                    <button
                                        onClick={() => setSubjectModal({ mode: 'edit', subject: s, form: { code: s.code, name: s.name, type: s.type } })}
                                        className="grid place-items-center w-9 h-9 rounded-xl bg-elevated hover:bg-primary-50 dark:hover:bg-primary-500/15 text-ink-soft hover:text-primary-600 dark:hover:text-primary-400 border border-line transition-colors active:scale-95"
                                        title={`Edit ${s.name}`}
                                        aria-label={`Edit ${s.name}`}
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDialog({
                                            title: 'Hapus Mata Pelajaran',
                                            message: `Hapus mata pelajaran "${s.name}"?`,
                                            confirmLabel: 'Ya, Hapus',
                                            action: () => router.delete(route('admin.subjects.destroy', s.id), { preserveScroll: true }),
                                        })}
                                        className="grid place-items-center w-9 h-9 rounded-xl bg-elevated hover:bg-rose-50 dark:hover:bg-rose-500/15 text-ink-soft hover:text-cancelled border border-line transition-colors active:scale-95"
                                        title={`Hapus ${s.name}`}
                                        aria-label={`Hapus ${s.name}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {subjects.length === 0 && (
                            <p className="text-center text-xs text-ink-faint py-6">Belum ada mata pelajaran.</p>
                        )}
                    </div>
                </section>
            )}

            {/* SECTION 3: WHATSAPP BOT CONFIGURATION & TEST BLAST */}
            {activeSection === 'WAHA' && (
                <section className="space-y-5 animate-fade-in-up">
                    {/* Form Konfigurasi Koneksi WAHA */}
                    <div className="bg-card rounded-3xl p-5 border border-line shadow-card">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-line-soft">
                            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-primary-600/10 text-primary-600 dark:text-primary-400 shrink-0">
                                <Settings className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="font-extrabold text-ink text-sm tracking-tight">Server WAHA &amp; API Key</h3>
                                <p className="text-xs text-ink-soft">Endpoint WAHA, Session Name, API Key, dan JID WhatsApp</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveConfigSubmit} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="WAHA Base URL" icon={<Globe className="w-3 h-3" />} error={configForm.errors.waha_base_url}>
                                    <input
                                        type="text"
                                        placeholder="http://localhost:3000"
                                        value={configForm.data.waha_base_url}
                                        onChange={(e) => configForm.setData('waha_base_url', e.target.value)}
                                        className={`${fieldInputCls} font-mono`}
                                        required
                                    />
                                </Field>

                                <Field label="Session Name" icon={<Layers className="w-3 h-3" />} error={configForm.errors.waha_session}>
                                    <input
                                        type="text"
                                        placeholder="default"
                                        value={configForm.data.waha_session}
                                        onChange={(e) => configForm.setData('waha_session', e.target.value)}
                                        className={`${fieldInputCls} font-mono`}
                                        required
                                    />
                                </Field>
                            </div>

                            <Field label="WAHA API Key (Opsional)" icon={<Key className="w-3 h-3" />}>
                                <input
                                    type="password"
                                    placeholder="Masukkan API Key jika instance diproteksi..."
                                    value={configForm.data.waha_api_key}
                                    onChange={(e) => configForm.setData('waha_api_key', e.target.value)}
                                    className={`${fieldInputCls} font-mono`}
                                />
                                <p className="text-[11px] text-ink-faint mt-1.5">Kosongkan jika instance WAHA tidak memerlukan autentikasi API Key.</p>
                            </Field>

                            {/* Daftar JID Grup & Tombol Tarik Grup */}
                            <div className="pt-3 border-t border-line-soft space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <h4 className="text-xs font-bold text-ink">Group JID Pengiriman</h4>
                                    <button
                                        type="button"
                                        onClick={handleFetchWahaGroups}
                                        disabled={fetchingGroups}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-600/10 hover:bg-primary-600/20 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-xl border border-primary-200/60 dark:border-primary-500/30 transition-all disabled:opacity-50"
                                    >
                                        <DownloadCloud className={`w-3.5 h-3.5 ${fetchingGroups ? 'animate-bounce' : ''}`} />
                                        <span>{fetchingGroups ? 'Mengambil...' : 'Tarik Daftar Grup'}</span>
                                    </button>
                                </div>

                                {fetchError && (
                                    <div className="p-3 bg-cancelled-bg border border-cancelled-line text-rose-800 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2" role="alert">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-px text-cancelled" />
                                        <span>{fetchError}</span>
                                    </div>
                                )}

                                {/* Jika ada grup yang ditarik dari WAHA */}
                                {fetchedGroups.length > 0 && (
                                    <div className="p-3.5 bg-safe-bg/70 dark:bg-emerald-500/10 border border-safe-line rounded-2xl space-y-2 animate-fade-in-up">
                                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-safe" />
                                            Ditemukan {fetchedGroups.length} grup di bot:
                                        </p>
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto scroll-smooth-panel pr-1">
                                            {fetchedGroups.map((g) => (
                                                <div key={g.id} className="p-2.5 bg-card rounded-xl border border-emerald-100/70 dark:border-emerald-500/20 flex items-center justify-between gap-2 text-xs">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-ink truncate">{g.name}</p>
                                                        <p className="text-[10px] font-mono text-ink-faint truncate">{g.id}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button type="button" onClick={() => assignFetchedJid('BB_THEORY', g.id)} className="assign-btn text-primary-700 dark:text-primary-300 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/15 dark:hover:bg-primary-500/25">Teori BB</button>
                                                        <button type="button" onClick={() => assignFetchedJid('AA_THEORY', g.id)} className="assign-btn text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25">Teori AA</button>
                                                        <button type="button" onClick={() => assignFetchedJid('B1_PRACTICUM', g.id)} className="assign-btn text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25">Lab B1</button>
                                                        <button type="button" onClick={() => assignFetchedJid('B2_PRACTICUM', g.id)} className="assign-btn text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/15 dark:hover:bg-purple-500/25">Lab B2</button>
                                                        <button type="button" onClick={() => assignFetchedJid('A1_PRACTICUM', g.id)} className="assign-btn text-teal-700 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-500/15 dark:hover:bg-teal-500/25">Lab A1</button>
                                                        <button type="button" onClick={() => assignFetchedJid('A2_PRACTICUM', g.id)} className="assign-btn text-orange-700 dark:text-orange-300 bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/15 dark:hover:bg-orange-500/25">Lab A2</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2.5">
                                    {configForm.data.groups.map((grp, idx) => (
                                        <div key={grp.id} className="p-3.5 bg-elevated/60 rounded-2xl border border-line-soft">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="text-xs font-bold text-ink truncate">{grp.group_name}</span>
                                                <Badge variant="primary">{grp.target_group}</Badge>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="120363000000000000@g.us"
                                                value={grp.group_jid}
                                                onChange={(e) => handleGroupJidChange(idx, e.target.value)}
                                                className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs font-mono text-ink placeholder:text-ink-faint focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                                                aria-label={`JID untuk ${grp.group_name}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {configSaveSuccess && (
                                <div className="p-3 bg-safe-bg border border-safe-line text-emerald-900 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in-up" role="status">
                                    <CheckCircle2 className="w-4 h-4 text-safe shrink-0" />
                                    Pengaturan WAHA &amp; JID grup berhasil disimpan!
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={configForm.processing}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                            >
                                {configForm.processing ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        Simpan Konfigurasi WAHA
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Test Blast Card */}
                    <div className="bg-card rounded-3xl p-5 border border-line shadow-card">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line-soft">
                            <span className="grid place-items-center w-10 h-10 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Send className="w-5 h-5" />
                            </span>
                            <div>
                                <h3 className="font-extrabold text-ink text-sm tracking-tight">Uji Coba WhatsApp Blast (@everyone)</h3>
                                <p className="text-xs text-ink-soft">Test koneksi server WAHA &amp; tag semua anggota grup</p>
                            </div>
                        </div>

                        <form onSubmit={handleTestBlastSubmit} className="space-y-3">
                            <Field label="Target Grup WhatsApp">
                                <select
                                    value={testBlastForm.data.target_group}
                                    onChange={(e) => {
                                        testBlastForm.setData('target_group', e.target.value);
                                        setBlastResult(null);
                                    }}
                                    className={fieldInputCls}
                                >
                                    <option value="BB_THEORY">Grup Kelas BB (Teori)</option>
                                    <option value="AA_THEORY">Grup Kelas AA (Teori)</option>
                                    <option value="B1_PRACTICUM">Grup Praktikum B1</option>
                                    <option value="B2_PRACTICUM">Grup Praktikum B2</option>
                                    <option value="A1_PRACTICUM">Grup Praktikum A1</option>
                                    <option value="A2_PRACTICUM">Grup Praktikum A2</option>
                                </select>
                            </Field>

                            <Field label="Pesan Kustom (Opsional)">
                                <textarea
                                    rows="2"
                                    placeholder="Tulis pesan pengujian... (Jika kosong, menggunakan template default)"
                                    value={testBlastForm.data.message}
                                    onChange={(e) => testBlastForm.setData('message', e.target.value)}
                                    className={fieldInputCls}
                                />
                            </Field>

                            {blastResult && (
                                <div className={`p-3.5 rounded-2xl text-xs border flex items-start gap-2 animate-fade-in-up ${
                                    blastResult.success 
                                        ? 'bg-safe-bg border-safe-line text-emerald-900 dark:text-emerald-300' 
                                        : 'bg-cancelled-bg border-cancelled-line text-rose-900 dark:text-rose-300'
                                }`} role="status">
                                    {blastResult.success ? (
                                        <CheckCircle2 className="w-4 h-4 text-safe shrink-0 mt-px" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-cancelled shrink-0 mt-px" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold">{blastResult.success ? 'Berhasil Terkirim' : 'Gagal Terkirim'}</p>
                                        <p className="text-[11px] mt-0.5 opacity-90 break-words">{blastResult.message}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={testBlastForm.processing}
                                className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.98] disabled:opacity-60"
                            >
                                {testBlastForm.processing ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Mengirim pesan blast...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        Kirim Blast Uji Coba
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            )}

            {/* SECTION 3: LOGS PENGIRIMAN */}
            {activeSection === 'LOGS' && (
                <section className="space-y-3 animate-fade-in-up">
                    <h3 className="font-extrabold text-ink text-sm px-1 tracking-tight">Riwayat Log Notifikasi WhatsApp</h3>

                    {recentLogs.length === 0 ? (
                        <div className="rounded-3xl p-10 text-center bg-card border border-dashed border-line">
                            <History className="w-7 h-7 text-ink-faint mx-auto mb-2" />
                            <p className="text-xs text-ink-soft">Belum ada riwayat notifikasi yang terkirim.</p>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {recentLogs.map((log) => (
                                <article key={log.id} className="bg-card rounded-2xl p-4 border border-line shadow-card text-xs">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <Badge variant="online">{log.event_type}</Badge>
                                        <time className="text-[11px] text-ink-faint">{log.sent_at}</time>
                                    </div>
                                    <p className="font-semibold text-ink-soft">Target: {log.target_group}</p>
                                    {log.payload?.text_preview && (
                                        <pre className="whitespace-pre-wrap mt-2 text-[11px] leading-relaxed text-ink-soft bg-elevated p-2.5 rounded-xl border border-line-soft font-mono overflow-x-auto">
                                            {log.payload.text_preview}
                                        </pre>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}
            {userModal && (
                <UserModal
                    modal={userModal}
                    onClose={() => setUserModal(null)}
                    onSubmit={(form) => {
                        const isEdit = userModal.mode === 'edit';
                        const url = isEdit ? route('admin.users.update', userModal.user.id) : route('admin.users.store');
                        router[isEdit ? 'put' : 'post'](url, form, {
                            preserveScroll: true,
                            onSuccess: () => setUserModal(null),
                        });
                    }}
                />
            )}
            {subjectModal && (
                <SubjectModal
                    modal={subjectModal}
                    onClose={() => setSubjectModal(null)}
                    onSubmit={(form) => {
                        const isEdit = subjectModal.mode === 'edit';
                        const url = isEdit ? route('admin.subjects.update', subjectModal.subject.id) : route('admin.subjects.store');
                        router[isEdit ? 'put' : 'post'](url, form, {
                            preserveScroll: true,
                            onSuccess: () => setSubjectModal(null),
                        });
                    }}
                />
            )}
            {confirmDialog && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmLabel={confirmDialog.confirmLabel}
                    onConfirm={() => { confirmDialog.action(); setConfirmDialog(null); }}
                    onClose={() => setConfirmDialog(null)}
                />
            )}
        </AuthenticatedLayout>
    );
}

const fieldInputCls = 'w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all';

function AdminTab({ active, onClick, icon, label }) {
    return (
        <button
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`py-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 transition-all ${
                active ? 'bg-card text-primary-600 dark:text-primary-400 shadow-btn ring-1 ring-line' : 'text-ink-soft hover:text-ink'
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function Field({ label, icon, error, children }) {
    return (
        <div>
            <label className="flex items-center gap-1 text-xs font-bold text-ink-soft mb-1.5">
                {icon && <span className="text-ink-faint">{icon}</span>}
                {label}
            </label>
            {children}
            {error && <p className="text-[11px] text-cancelled mt-1 font-medium" role="alert">{error}</p>}
        </div>
    );
}

function SubjectModal({ modal, onClose, onSubmit }) {
    const isEdit = modal.mode === 'edit';
    const [form, setForm] = useState(modal.form);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit mata pelajaran' : 'Tambah mata pelajaran'}>
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-sm bg-card rounded-3xl border border-line shadow-modal p-5 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-ink text-sm tracking-tight">{isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                    <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-xl bg-elevated text-ink-soft hover:text-ink transition-colors" aria-label="Tutup">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-ink-soft mb-1.5">Kode</label>
                        <input
                            type="text"
                            required
                            maxLength={20}
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            className={fieldInputCls}
                            placeholder="Contoh: PWL"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ink-soft mb-1.5">Nama Mata Pelajaran</label>
                        <input
                            type="text"
                            required
                            maxLength={100}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={fieldInputCls}
                            placeholder="Contoh: Pemrograman Web Lanjut"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ink-soft mb-1.5">Jenis</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={fieldInputCls}>
                            <option value="THEORY">Teori</option>
                            <option value="PRACTICUM">Praktikum</option>
                        </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full bg-elevated text-ink-soft text-xs font-bold border border-line hover:text-ink transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.98]">
                            {isEdit ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UserModal({ modal, onClose, onSubmit }) {
    const isEdit = modal.mode === 'edit';
    const [form, setForm] = useState(modal.form);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit mahasiswa' : 'Tambah mahasiswa'}>
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-sm bg-card rounded-3xl border border-line shadow-modal p-5 animate-scale-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-ink text-sm tracking-tight">{isEdit ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h3>
                    <button onClick={onClose} className="grid place-items-center w-8 h-8 rounded-xl bg-elevated text-ink-soft hover:text-ink transition-colors" aria-label="Tutup">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-ink-soft mb-1.5">NIU</label>
                        <input
                            type="text"
                            required
                            maxLength={30}
                            value={form.niu}
                            onChange={(e) => setForm({ ...form, niu: e.target.value })}
                            className={fieldInputCls}
                            placeholder="Contoh: 2110512001"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-ink-soft mb-1.5">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            maxLength={100}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className={fieldInputCls}
                            placeholder="Nama mahasiswa"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-ink-soft mb-1.5">Role</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={fieldInputCls}>
                                <option value="STUDENT">Mahasiswa</option>
                                <option value="PJ">Penanggung Jawab</option>
                                <option value="ADMIN">Komti</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink-soft mb-1.5">Kelas Teori</label>
                            <select value={form.theory_class} onChange={(e) => setForm({ ...form, theory_class: e.target.value })} className={fieldInputCls}>
                                <option value="BB">BB</option>
                                <option value="AA">AA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-ink-soft mb-1.5">Kloter</label>
                            <select value={form.practicum_group} onChange={(e) => setForm({ ...form, practicum_group: e.target.value })} className={fieldInputCls}>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="A1">A1</option>
                                <option value="A2">A2</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full bg-elevated text-ink-soft text-xs font-bold border border-line hover:text-ink transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.98]">
                            {isEdit ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


