import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, CheckSquare, Send, CalendarClock } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, subjects = [] }) {
    if (!isOpen) return null;

    const { data, setData, post, processing, errors, reset } = useForm({
        subject_id: subjects.length > 0 ? subjects[0].id : '',
        target_group: 'BB_THEORY',
        title: '',
        description: '',
        deadline: '',
        submission_url: '',
        submission_format: '',
        send_waha_blast: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tasks.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const inputCls = 'w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto scroll-smooth-panel bg-overlay backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Tambah Tugas">
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-modal relative border border-line animate-scale-in my-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-line-soft">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shrink-0 shadow-btn">
                            <CheckSquare className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="font-extrabold text-ink text-base tracking-tight leading-tight">Tambah Tugas</h3>
                            <p className="text-xs text-ink-soft">Buat reminder tugas dan blast deadline ke grup</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Tutup"
                        className="text-ink-faint hover:text-ink p-2 rounded-xl hover:bg-elevated transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
                    {/* Mata Kuliah */}
                    <Field label="Mata Kuliah" required error={errors.subject_id}>
                        <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} className={inputCls}>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name} ({s.code}) - {s.type === 'THEORY' ? 'Teori' : 'Praktikum'}
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Target Mahasiswa */}
                    <Field label="Target Mahasiswa" required error={errors.target_group}>
                        <select value={data.target_group} onChange={(e) => setData('target_group', e.target.value)} className={inputCls}>
                            <option value="BB_THEORY">Kelas Teori BB</option>
                            <option value="AA_THEORY">Kelas Teori AA</option>
                            <option value="B1_PRACTICUM">Kloter B1 (Praktikum)</option>
                            <option value="B2_PRACTICUM">Kloter B2 (Praktikum)</option>
                            <option value="A1_PRACTICUM">Kloter A1 (Praktikum)</option>
                            <option value="A2_PRACTICUM">Kloter A2 (Praktikum)</option>
                        </select>
                    </Field>

                    {/* Judul Tugas */}
                    <Field label="Judul / Topik Tugas" required error={errors.title}>
                        <input
                            type="text"
                            placeholder="Contoh: Laporan Akhir Modul 4 (VLAN)"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    {/* Deadline */}
                    <Field label="Tenggat Waktu (Deadline)" required error={errors.deadline}>
                        <input
                            type="datetime-local"
                            value={data.deadline}
                            onChange={(e) => setData('deadline', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    {/* Submission URL & Format */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Field label="Link Submission">
                            <input
                                type="url"
                                placeholder="https://classroom.google.com/..."
                                value={data.submission_url}
                                onChange={(e) => setData('submission_url', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                        <Field label="Format File">
                            <input
                                type="text"
                                placeholder="NIU_Nama_Tugas.pdf"
                                value={data.submission_format}
                                onChange={(e) => setData('submission_format', e.target.value)}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    {/* Deskripsi */}
                    <Field label="Instruksi / Deskripsi Singkat">
                        <textarea
                            rows="2"
                            placeholder="Petunjuk pengerjaan tugas..."
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    {/* WhatsApp Blast */}
                    <label className="flex items-center justify-between gap-3 cursor-pointer select-none bg-primary-50/70 dark:bg-primary-500/10 p-3.5 rounded-2xl border border-primary-200/70 dark:border-primary-500/30 transition-colors hover:bg-primary-50 dark:hover:bg-primary-500/15">
                        <span className="flex items-center gap-2.5 min-w-0">
                            <Send className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                            <span className="min-w-0">
                                <span className="block text-xs font-bold text-primary-900 dark:text-primary-300">Blast Notifikasi WhatsApp</span>
                                <span className="block text-[11px] text-primary-700/90 dark:text-primary-400/90 truncate">Kirim pemberitahuan instan ke grup terkait</span>
                            </span>
                        </span>
                        <ToggleInput checked={data.send_waha_blast} onChange={(v) => setData('send_waha_blast', v)} />
                    </label>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink rounded-full hover:bg-elevated transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white text-xs font-bold shadow-btn transition-all active:scale-95 disabled:opacity-60"
                        >
                            {processing ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <CalendarClock className="w-3.5 h-3.5" />
                                    Simpan Tugas
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, required = false, error, children }) {
    return (
        <div>
            {label && (
                <label className="block text-xs font-bold text-ink-soft mb-1.5">
                    {label} {required && <span className="text-cancelled">*</span>}
                </label>
            )}
            {children}
            {error && <p className="text-xs text-cancelled mt-1.5 font-medium" role="alert">{error}</p>}
        </div>
    );
}

function ToggleInput({ checked, onChange }) {
    return (
        <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}></span>
        </span>
    );
}
