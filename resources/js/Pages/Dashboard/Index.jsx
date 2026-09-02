import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Badge from '../../Components/Badge';
import CountdownTimer from '../../Components/CountdownTimer';
import EmergencyOverrideModal from '../../Components/EmergencyOverrideModal';
import CreateTaskModal from '../../Components/CreateTaskModal';
import ScheduleCard from '../../Components/ScheduleCard';
import { 
    Calendar, Video, ExternalLink, CheckCircle, Circle, Plus, ShieldAlert, Sparkles, Pin, ArrowRight
} from 'lucide-react';

export default function Dashboard({ todaySchedules = [], priorityTasks = [], manageableSubjects = [], todayDateFormatted }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);

    const openEmergencyModal = (scheduleId = null) => {
        setSelectedScheduleId(scheduleId);
        setIsEmergencyModalOpen(true);
    };

    const handleToggleTask = (taskId) => {
        router.post(route('tasks.toggle', taskId), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard - Agenda Hari Ini" />

            {/* Hero Banner — Night Sky */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-900 via-slate-900 to-slate-950 p-5 pb-6 mb-6 shadow-card animate-fade-in-up">
                {/* Decorative glows */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -top-12 -right-8 w-40 h-40 rounded-full bg-primary-500/20 blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-6 w-36 h-36 rounded-full bg-sky-500/15 blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/15 mb-3">
                        <Calendar className="w-3 h-3" />
                        Agenda Hari Ini
                    </span>
                    <div className="flex items-end justify-between gap-3">
                        <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                            {todayDateFormatted}
                        </h2>
                        {user?.is_pj && (
                            <button
                                onClick={() => openEmergencyModal()}
                                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/95 hover:bg-white text-primary-800 text-xs font-bold rounded-full shadow-lg transition-all active:scale-95"
                            >
                                <ShieldAlert className="w-3.5 h-3.5 text-online" />
                                Switch Daring
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Action Pills for PJ / Admin */}
            {user?.is_pj && (
                <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1 text-xs -mx-4 px-4 [scrollbar-width:none]">
                    <button
                        onClick={() => openEmergencyModal()}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-online-bg border border-online-line text-purple-700 dark:text-purple-300 rounded-full font-bold transition-all hover:scale-[1.03]"
                    >
                        <Video className="w-3.5 h-3.5" />
                        Dosen Berhalangan (Zoom)
                    </button>
                    <button
                        onClick={() => setIsCreateTaskModalOpen(true)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-btn transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Tugas Baru
                    </button>
                </div>
            )}

            {/* SECTION 1: AGENDA JADWAL HARI INI */}
            <section className="mb-8" aria-labelledby="sec-jadwal">
                <SectionHeader id="sec-jadwal" icon={<Calendar className="w-4 h-4" />} title="Jadwal Hari Ini" count={todaySchedules.length} linkHref={route('schedules.index')} linkLabel="Kalender" />

                {todaySchedules.length === 0 ? (
                    <EmptyState
                        icon={<Sparkles className="w-6 h-6" />}
                        tone="safe"
                        title="Tidak Ada Jadwal Hari Ini"
                        desc="Nikmati waktu luang Anda atau kerjakan tugas yang ada!"
                    />
                ) : (
                    <div className="space-y-3.5">
                        {todaySchedules.filter((s) => s.end_time >= new Date().toTimeString().slice(0, 5)).map((schedule) => (
                            <ScheduleCard
                                key={schedule.id}
                                schedule={schedule}
                                isToday
                                onManage={user?.is_pj ? (id) => openEmergencyModal(id) : null}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* SECTION 2: TUGAS PRIORITAS & PERSONAL CHECKLIST */}
            <section aria-labelledby="sec-tugas">
                <SectionHeader id="sec-tugas" icon={<Pin className="w-4 h-4" />} title="Tugas Prioritas" count={priorityTasks.length} linkHref={route('tasks.index')} linkLabel="Semua Tugas" />

                {priorityTasks.length === 0 ? (
                    <EmptyState
                        icon={<CheckCircle className="w-6 h-6" />}
                        tone="primary"
                        title="Tidak Ada Tugas Mendesak"
                        desc="Semua tugas prioritas sudah aman. Tetap semangat!"
                    />
                ) : (
                    <div className="space-y-3">
                        {priorityTasks.map((task) => (
                            <article
                                key={task.id}
                                className={`group relative overflow-hidden rounded-3xl p-4 bg-card border transition-all shadow-card ${
                                    task.is_completed ? 'opacity-60' : 'border-line/70 hover:shadow-card-hover hover:-translate-y-0.5'
                                }`}
                            >
                                {/* Left urgency rail */}
                                {!task.is_completed && task.urgency === 'urgent' && (
                                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cancelled to-rose-400"></span>
                                )}

                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <Badge variant={task.urgency}>{task.deadline_human}</Badge>
                                        <Badge variant="default">{task.subject_name}</Badge>
                                    </div>

                                    {task.urgency === 'urgent' && !task.is_completed && (
                                        <CountdownTimer targetDate={task.deadline} />
                                    )}
                                </div>

                                <div className="flex items-start gap-3 my-2">
                                    <button
                                        onClick={() => handleToggleTask(task.id)}
                                        className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${task.is_completed ? '' : 'text-ink-faint hover:text-safe'}`}
                                        title={task.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                                        aria-label={task.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                                    >
                                        {task.is_completed ? (
                                            <CheckCircle className="w-5 h-5 text-safe fill-safe-bg" />
                                        ) : (
                                            <Circle className="w-5 h-5 group-hover:text-safe transition-colors" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-sm text-ink leading-snug ${task.is_completed ? 'line-through text-ink-faint' : ''}`}>
                                            {task.title}
                                        </h4>
                                        {task.description && (
                                            <p className="text-xs text-ink-soft mt-0.5 line-clamp-2">{task.description}</p>
                                        )}
                                        <div className="text-[11px] text-ink-faint mt-1.5 flex flex-wrap items-center gap-x-2">
                                            <span>{task.deadline_formatted} WIB</span>
                                            {task.submission_format && <span>• Format: {task.submission_format}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 mt-1 border-t border-line/50 text-xs">
                                    {task.submission_url ? (
                                        <a
                                            href={task.submission_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1"
                                        >
                                            <span>Buka Pengumpulan</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-ink-faint">Pengumpulan via instruksi kelas</span>
                                    )}

                                    <button
                                        onClick={() => handleToggleTask(task.id)}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95 ${
                                            task.is_completed
                                                ? 'bg-elevated text-ink-soft hover:text-ink'
                                                : 'bg-safe-bg border border-safe-line text-safe hover:bg-emerald-100 dark:hover:bg-emerald-500/15'
                                        }`}
                                    >
                                        {task.is_completed ? 'Batal Selesai' : '✓ Selesai'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Modals */}
            <EmergencyOverrideModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                schedules={todaySchedules}
                defaultScheduleId={selectedScheduleId}
            />

            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                subjects={manageableSubjects}
            />
        </AuthenticatedLayout>
    );
}

function SectionHeader({ id, icon, title, count, linkHref, linkLabel }) {
    return (
        <div className="flex items-center justify-between gap-2 mb-4">
            <h3 id={id} className="inline-flex items-center gap-2 font-bold text-ink text-sm tracking-tight min-w-0">
                <span className="grid place-items-center w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 shrink-0">{icon}</span>
                <span className="truncate">{title}</span>
                <span className="shrink-0 inline-grid place-items-center min-w-5 h-5 px-1.5 rounded-full bg-elevated/80 text-ink-soft text-[11px] font-bold">
                    {count}
                </span>
            </h3>
            <Link href={linkHref} className="shrink-0 inline-flex items-center gap-0.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
                {linkLabel}
                <ArrowRight className="w-3 h-3" />
            </Link>
        </div>
    );
}

function EmptyState({ icon, tone, title, desc }) {
    const tones = {
        safe: 'bg-safe-bg text-safe',
        primary: 'bg-primary-50 dark:bg-primary-500/10 text-primary-500',
    };
    return (
        <div className="rounded-3xl p-8 text-center bg-card border border-dashed border-line/60">
            <span className={`inline-grid place-items-center w-12 h-12 rounded-2xl mb-3 ${tones[tone] || tones.primary}`}>{icon}</span>
            <h4 className="font-bold text-ink text-sm">{title}</h4>
            <p className="text-xs text-ink-soft mt-1 max-w-[240px] mx-auto">{desc}</p>
        </div>
    );
}
