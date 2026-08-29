import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Home, Calendar, CheckSquare, LogOut, ShieldAlert, Sparkles, 
    User, Bell, CheckCircle2, AlertCircle, Settings, ShieldCheck,
    Moon, Sun
} from 'lucide-react';
import Badge from '../Components/Badge';
import EmergencyOverrideModal from '../Components/EmergencyOverrideModal';

/** Tema helper: baca/tulis preferensi tema ke localStorage & <html>.dark */
function useTheme() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
        document.querySelector('meta[name="theme-color"]')?.setAttribute(
            'content',
            theme === 'dark' ? '#060913' : '#4f46e5'
        );
    }, [theme]);

    return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}

export default function AuthenticatedLayout({ children }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const currentPath = window.location.pathname;

    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [theme, toggleTheme] = useTheme();

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

    return (
        <div className="min-h-screen bg-surface flex flex-col font-sans">
            {/* Top Bar — floating glass */}
            <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-2xl border-b border-line/50">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center text-white shadow-btn ring-1 ring-primary-400/40 shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <h1 className="font-extrabold text-ink text-sm tracking-tight leading-tight truncate">
                                    {user?.name || 'Mahasiswa'}
                                </h1>
                                {user?.is_admin && <Badge variant="admin">Komti</Badge>}
                                {user?.is_pj && !user?.is_admin && <Badge variant="pj">PJ</Badge>}
                            </div>
                            <p className="text-[11px] text-ink-soft flex items-center gap-1.5 truncate">
                                <span>{user?.niu}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-ink-faint"></span>
                                <span className="font-bold text-primary-600 dark:text-primary-400">Kloter {user?.practicum_group}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Toggle Tema Gelap/Terang */}
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                            className="p-2.5 text-ink-soft hover:text-primary-500 hover:bg-elevated rounded-xl transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>

                        {user?.is_admin && (
                            <Link
                                href={route('admin.index')}
                                className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                    currentPath.startsWith('/admin')
                                        ? 'bg-gradient-to-r from-cancelled to-rose-500 text-white shadow-btn'
                                        : 'bg-cancelled-bg border border-cancelled-line text-rose-700 dark:text-rose-300 hover:brightness-95'
                                }`}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Admin</span>
                            </Link>
                        )}

                        {user?.is_pj && (
                            <button
                                onClick={() => setIsEmergencyModalOpen(true)}
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-online-bg border border-online-line text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl transition-all hover:scale-[1.03]"
                            >
                                <ShieldAlert className="w-3.5 h-3.5" />
                                Override
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            title="Keluar"
                            aria-label="Keluar"
                            className="p-2.5 text-ink-faint hover:text-cancelled hover:bg-cancelled-bg rounded-xl transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Flash Messages */}
            <div className="max-w-2xl mx-auto w-full px-4 pt-4">
                {flash?.success && (
                    <div className="mb-3 p-3.5 bg-safe-bg/80 backdrop-blur-sm border border-safe-line text-emerald-900 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in-up shadow-card">
                        <span className="w-6 h-6 rounded-lg bg-safe text-white grid place-items-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-3 p-3.5 bg-cancelled-bg/80 backdrop-blur-sm border border-cancelled-line text-rose-900 dark:text-rose-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in-up shadow-card">
                        <span className="w-6 h-6 rounded-lg bg-cancelled text-white grid place-items-center shrink-0">
                            <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                        <span>{flash.error}</span>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-32 pt-4">
                {children}
            </main>

            {/* Floating Dock Navigation */}
            <nav className="fixed bottom-0 inset-x-0 z-40 pb-safe pointer-events-none" aria-label="Navigasi utama">
                <div className="max-w-md mx-auto px-5 pb-5">
                    <div className="pointer-events-auto bg-card/90 backdrop-blur-2xl border border-line/60 rounded-[28px] shadow-dock flex items-center justify-around py-2.5 px-3 gap-1">
                        <NavLink href={route('dashboard')} active={currentPath === '/dashboard'} icon={<Home className="w-5 h-5" />} label="Home" />
                        <NavLink href={route('schedules.index')} active={currentPath.startsWith('/schedules')} icon={<Calendar className="w-5 h-5" />} label="Jadwal" />
                        <NavLink href={route('tasks.index')} active={currentPath.startsWith('/tasks')} icon={<CheckSquare className="w-5 h-5" />} label="Tugas" />
                        {user?.is_admin && (
                            <NavLink href={route('admin.index')} active={currentPath.startsWith('/admin')} danger icon={<ShieldCheck className="w-5 h-5" />} label="Admin" />
                        )}
                    </div>
                </div>
            </nav>

            {/* Global Emergency Modal for PJ/Admin */}
            {user?.is_pj && (
                <EmergencyOverrideModal
                    isOpen={isEmergencyModalOpen}
                    onClose={() => setIsEmergencyModalOpen(false)}
                    schedules={[]}
                />
            )}
        </div>
    );
}

function NavLink({ href, active, icon, label, danger = false }) {
    if (active) {
        return (
            <Link
                href={href}
                aria-current="page"
                className={`flex items-center gap-2 py-2.5 pl-4 pr-5 rounded-full text-white font-bold text-[13px] transition-all ${
                    danger ? 'bg-gradient-to-r from-cancelled to-rose-500 shadow-btn' : 'bg-gradient-to-r from-primary-600 to-primary-500 shadow-btn'
                }`}
            >
                {icon}
                <span>{label}</span>
            </Link>
        );
    }
    return (
        <Link
            href={href}
            className="flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl text-ink-faint hover:text-ink-soft transition-colors"
        >
            {icon}
            <span className="text-[10px] font-semibold">{label}</span>
        </Link>
    );
}
