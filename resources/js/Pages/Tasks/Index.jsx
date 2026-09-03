import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Badge from '../../Components/Badge';
import CountdownTimer from '../../Components/CountdownTimer';
import CreateTaskModal from '../../Components/CreateTaskModal';
import { ExternalLink, CheckCircle, Circle, Plus, Sparkles, Clock, FileText, PartyPopper, ClipboardList, X } from 'lucide-react';

export default function TasksIndex({ pendingTasks = [], completedTasks = [], manageableSubjects = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' or 'COMPLETED'
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [detailTask, setDetailTask] = useState(null);

    const handleToggleTask = (taskId) => {
        router.post(route('tasks.toggle', taskId), {}, {
            preserveScroll: true,
        });
    };

    const currentList = activeTab === 'PENDING' ? pendingTasks : completedTasks;

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Tugas Kuliah & Praktikum" />

            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                    <h2 className="text-xl font-extrabold text-ink tracking-tight">Daftar Tugas &amp; Proyek</h2>
                    <p className="text-xs text-ink-soft mt-0.5">Kelola checklist personal dan pantau deadline</p>
                </div>

                {user?.is_pj && (
                    <button
                        onClick={() => setIsCreateTaskModalOpen(true)}
                        className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold rounded-full shadow-btn transition-all active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Tugas
                    </button>
                )}
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-1.5 bg-elevated/80 p-1.5 rounded-2xl mb-5" role="tablist" aria-label="Filter status tugas">
                <TabButton active={activeTab === 'PENDING'} onClick={() => setActiveTab('PENDING')} label="Belum Selesai" count={pendingTasks.length} countTone="bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300" />
                <TabButton active={activeTab === 'COMPLETED'} onClick={() => setActiveTab('COMPLETED')} label="Sudah Selesai" count={completedTasks.length} countTone="bg-safe-bg text-safe" />
            </div>

            {/* Task List */}
            {currentList.length === 0 ? (
                <div className="rounded-3xl p-10 text-center bg-card border border-dashed border-line/60 animate-fade-in-up">
                    <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-elevated text-primary-500 mb-3">
                        {activeTab === 'PENDING' ? <PartyPopper className="w-7 h-7" /> : <ClipboardList className="w-7 h-7" />}
                    </span>
                    <h4 className="font-bold text-ink text-sm">
                        {activeTab === 'PENDING' ? 'Semua Tugas Selesai' : 'Belum Ada Riwayat'}
                    </h4>
                    <p className="text-xs text-ink-faint mt-1 max-w-[260px] mx-auto">
                        {activeTab === 'PENDING' ? 'Hebat! Tidak ada tanggungan tugas saat ini.' : 'Tandai tugas yang sudah Anda selesaikan.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3.5 animate-fade-in-up">
                    {currentList.map((task) => (
                        <article
                            key={task.id}
                            className={`relative overflow-hidden rounded-3xl p-4 pl-5 bg-card border transition-all shadow-card ${
                                task.is_completed
                                    ? 'border-safe-line/50 opacity-70'
                                    : task.urgency === 'urgent'
                                    ? 'border-cancelled-line/50 hover:shadow-card-hover hover:-translate-y-0.5'
                                    : 'border-line/70 hover:shadow-card-hover hover:-translate-y-0.5'
                            }`}
                        >
                            {/* Left rail */}
                            <span aria-hidden="true" className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${
                                task.is_completed
                                    ? 'from-emerald-500 to-teal-400'
                                    : task.urgency === 'urgent'
                                    ? 'from-rose-500 to-rose-400'
                                    : 'from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500'
                            }`}></span>

                            <div className="flex items-start justify-between gap-2 mb-2.5">
                                <div className="flex items-center gap-1.5 flex-wrap gap-y-1">
                                    <Badge variant={task.is_completed ? 'safe' : task.urgency}>
                                        {task.is_completed ? '✓ Selesai' : task.deadline_human}
                                    </Badge>
                                    <Badge variant="default">{task.subject_name}</Badge>
                                    <Badge variant={task.target_group.endsWith('_THEORY') ? 'theory' : 'practicum'}>
                                        {task.target_group.replace(/_(THEORY|PRACTICUM)$/, '')}
                                    </Badge>
                                </div>

                                {task.urgency === 'urgent' && !task.is_completed && (
                                    <CountdownTimer targetDate={task.deadline} />
                                )}
                            </div>

                            <div className="flex items-start gap-3 my-2.5">
                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`mt-0.5 shrink-0 transition-transform active:scale-90 ${task.is_completed ? '' : 'text-ink-faint hover:text-safe'}`}
                                    title={task.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                                    aria-label={task.is_completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                                >
                                    {task.is_completed ? (
                                        <CheckCircle className="w-5 h-5 text-safe fill-safe-bg" />
                                    ) : (
                                        <Circle className="w-5 h-5 hover:text-safe transition-colors" />
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <button
                                        onClick={() => setDetailTask(task)}
                                        className={`font-extrabold text-sm text-left leading-snug tracking-tight hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${
                                            task.is_completed ? 'line-through text-ink-faint' : 'text-ink'
                                        }`}
                                        title="Lihat Detail"
                                    >
                                        {task.title}
                                    </button>

                                    {task.description && (
                                        <p className="text-xs text-ink-soft mt-1 leading-relaxed whitespace-pre-line">{task.description}</p>
                                    )}

                                    <div className="text-xs text-ink-soft mt-2.5 space-y-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-ink-faint shrink-0" />
                                            <span><strong>Deadline:</strong> {task.deadline_formatted} WIB</span>
                                        </div>
                                        {task.submission_format && (
                                            <div className="flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 text-ink-faint shrink-0" />
                                                <span><strong>Format:</strong> {task.submission_format}</span>
                                            </div>
                                        )}
                                        {task.is_completed && task.completed_at && (
                                            <div className="text-safe font-semibold flex items-center gap-1.5">
                                                <CheckCircle className="w-3 h-3" /> Diselesaikan {task.completed_at}
                                            </div>
                                        )}
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
                                    <span className="text-ink-faint">Pengumpulan via instruksi</span>
                                )}

                                <button
                                    onClick={() => handleToggleTask(task.id)}
                                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
                                        task.is_completed
                                            ? 'bg-elevated text-ink-soft hover:text-ink'
                                            : 'inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-btn'
                                    }`}
                                >
                                    {!task.is_completed && <Sparkles className="w-3 h-3" />}
                                    {task.is_completed ? 'Batal Selesai' : '✓ Selesai'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Create Task Modal */}
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                subjects={manageableSubjects}
            />

            {/* Detail Task Modal */}
            <TaskDetailModal task={detailTask} onClose={() => setDetailTask(null)} />
        </AuthenticatedLayout>
    );
}

function TaskDetailModal({ task, onClose }) {
    if (!task) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto scroll-smooth-panel bg-overlay backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Detail Tugas">
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative bg-card/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-modal border border-line animate-scale-in my-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-line-soft">
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap gap-y-1 mb-1.5">
                            <Badge variant={task.is_completed ? 'safe' : task.urgency}>
                                {task.is_completed ? '✓ Selesai' : task.deadline_human}
                            </Badge>
                            <Badge variant="default">{task.subject_name}</Badge>
                            <Badge variant={task.target_group.endsWith('_THEORY') ? 'theory' : 'practicum'}>
                                {task.target_group.replace(/_(THEORY|PRACTICUM)$/, '')}
                            </Badge>
                        </div>
                        <h3 className={`font-extrabold text-base text-ink tracking-tight leading-snug ${task.is_completed ? 'line-through text-ink-faint' : ''}`}>
                            {task.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Tutup"
                        className="text-ink-faint hover:text-ink p-2 rounded-xl hover:bg-elevated transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {task.description ? (
                        <div>
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1.5">Deskripsi</h4>
                            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{task.description}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-ink-faint italic">Tidak ada deskripsi.</p>
                    )}

                    <div className="rounded-2xl bg-elevated/60 border border-line-soft p-4 space-y-2.5 text-xs">
                        <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                            <span className="text-ink-soft"><strong className="text-ink">Deadline:</strong> {task.deadline_formatted} WIB</span>
                        </div>
                        {task.submission_format && (
                            <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                                <span className="text-ink-soft"><strong className="text-ink">Format:</strong> {task.submission_format}</span>
                            </div>
                        )}
                        {task.is_completed && task.completed_at && (
                            <div className="flex items-center gap-2 text-safe font-semibold">
                                <CheckCircle className="w-3.5 h-3.5" /> Diselesaikan {task.completed_at}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 p-5 pt-4 border-t border-line-soft">
                    {task.submission_url ? (
                        <a
                            href={task.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-xs inline-flex items-center gap-1"
                        >
                            <span>Buka Pengumpulan</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    ) : (
                        <span className="text-xs text-ink-faint">Pengumpulan via instruksi</span>
                    )}
                    <button
                        onClick={() => { handleToggleTask(task.id); onClose(); }}
                        className={`text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 ${
                            task.is_completed
                                ? 'bg-elevated text-ink-soft hover:text-ink border border-line'
                                : 'inline-flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-btn'
                        }`}
                    >
                        {!task.is_completed && <Sparkles className="w-3.5 h-3.5" />}
                        {task.is_completed ? 'Batal Selesai' : '✓ Tandai Selesai'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label, count, countTone }) {
    return (
        <button
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                active ? 'bg-card shadow-btn ring-1 ring-line' : 'text-ink-soft hover:text-ink'
            }`}
        >
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] ${active ? countTone : 'bg-line text-ink-soft'}`}>
                {count}
            </span>
        </button>
    );
}
