import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, CalendarPlus, Save } from 'lucide-react';

const DAYS = [
    { value: 1, label: 'Senin' },
    { value: 2, label: 'Selasa' },
    { value: 3, label: 'Rabu' },
    { value: 4, label: 'Kamis' },
    { value: 5, label: 'Jumat' },
    { value: 6, label: 'Sabtu' },
];

const TARGETS = [
    { value: 'BB_THEORY', label: 'Teori BB' },
    { value: 'AA_THEORY', label: 'Teori AA' },
    { value: 'B1_PRACTICUM', label: 'Praktikum B1' },
    { value: 'B2_PRACTICUM', label: 'Praktikum B2' },
    { value: 'A1_PRACTICUM', label: 'Praktikum A1' },
    { value: 'A2_PRACTICUM', label: 'Praktikum A2' },
];

export default function ScheduleFormModal({ isOpen, onClose, subjects = [], schedule = null }) {
    if (!isOpen) return null;

    const isEdit = !!schedule;

    const { data, setData, post, put, processing, errors } = useForm({
        subject_id: schedule?.subject_id ?? (subjects[0]?.id ?? ''),
        target_group: schedule?.target_group ?? 'BB_THEORY',
        day_of_week: schedule?.day_of_week ?? 1,
        start_time: schedule?.start_time ?? '',
        end_time: schedule?.end_time ?? '',
        room: schedule?.room ?? '',
        lecturer_name: schedule?.lecturer_name ?? '',
        meeting_url: schedule?.meeting_url ?? '',
        description: schedule?.description ?? '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = { onSuccess: onClose };
        isEdit ? put(route('schedules.update', schedule.id), options) : post(route('schedules.store'), options);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto scroll-smooth-panel bg-overlay backdrop-blur-sm grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={isEdit ? 'Edit Jadwal' : 'Tambah Jadwal'}>
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-modal relative border border-line animate-scale-in my-8">
                <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-line-soft">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shrink-0 shadow-btn">
                            <CalendarPlus className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="font-extrabold text-ink text-base tracking-tight leading-tight">{isEdit ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
                            <p className="text-xs text-ink-soft">Jadwal master mingguan mata kuliah</p>
                        </div>
                    </div>
                    <button onClick={onClose} aria-label="Tutup" className="text-ink-faint hover:text-ink p-2 rounded-xl hover:bg-elevated transition-colors shrink-0">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <Field label="Mata Kuliah" required error={errors.subject_id}>
                        <select value={data.subject_id} onChange={(e) => setData('subject_id', e.target.value)} className={inputCls}>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Target Kelas" required error={errors.target_group}>
                        <select value={data.target_group} onChange={(e) => setData('target_group', e.target.value)} className={inputCls}>
                            {TARGETS.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="grid grid-cols-3 gap-2.5">
                        <Field label="Hari" required error={errors.day_of_week}>
                            <select value={data.day_of_week} onChange={(e) => setData('day_of_week', e.target.value)} className={inputCls}>
                                {DAYS.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Jam Mulai" required error={errors.start_time}>
                            <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Jam Selesai" required error={errors.end_time}>
                            <input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} className={inputCls} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <Field label="Ruangan" required error={errors.room}>
                            <input type="text" placeholder="Lab Jaringan 2" value={data.room} onChange={(e) => setData('room', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Nama Dosen" required error={errors.lecturer_name}>
                            <input type="text" placeholder="Dr. Budi Santoso" value={data.lecturer_name} onChange={(e) => setData('lecturer_name', e.target.value)} className={inputCls} />
                        </Field>
                    </div>

                    <Field label="Link Meeting (opsional)" error={errors.meeting_url}>
                        <input type="url" placeholder="https://zoom.us/j/..." value={data.meeting_url} onChange={(e) => setData('meeting_url', e.target.value)} className={inputCls} />
                    </Field>

                    <Field label="Deskripsi (opsional)" error={errors.description}>
                        <textarea rows={2} maxLength={1000} placeholder="Catatan tambahan, mis. bawa laptop, materi pertemuan ke-3" value={data.description} onChange={(e) => setData('description', e.target.value)} className={inputCls + ' resize-none'} />
                    </Field>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-bold text-ink-soft hover:text-ink rounded-full hover:bg-elevated transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white text-xs font-bold shadow-btn transition-all active:scale-95 disabled:opacity-60">
                            <Save className="w-3.5 h-3.5" />
                            {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputCls = 'w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all';

function Field({ label, required = false, error, children }) {
    return (
        <div>
            {label && (
                <label className="block text-xs font-bold mb-1.5 text-ink-soft">
                    {label} {required && <span className="text-cancelled">*</span>}
                </label>
            )}
            {children}
            {error && <p className="text-xs text-cancelled mt-1.5 font-medium" role="alert">{error}</p>}
        </div>
    );
}
