import React from 'react';
import { useForm } from '@inertiajs/react';
import { X, Video, AlertTriangle, Send, CalendarClock, CalendarX2, CalendarPlus } from 'lucide-react';

export default function EmergencyOverrideModal({ isOpen, onClose, schedules = [], defaultScheduleId = null }) {
    if (!isOpen) return null;

    const todayDate = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        schedule_id: defaultScheduleId || (schedules.length > 0 ? schedules[0].id : ''),
        original_date: todayDate,
        status: 'ONLINE',
        new_date: '',
        new_start_time: '',
        new_end_time: '',
        new_room: '',
        meeting_url: '',
        meeting_passcode: '',
        reason: '',
        send_waha_blast: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('schedules.override'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const statusOptions = [
        { value: 'ONLINE', label: 'Dosen Berhalangan (Ganti Online)', dot: 'bg-purple-600', icon: <Video className="w-4 h-4" />, tint: 'purple' },
        { value: 'RESCHEDULED', label: 'Geser Jam / Ganti Ruang', dot: 'bg-amber-500', icon: <CalendarClock className="w-4 h-4" />, tint: 'amber' },
        { value: 'CANCELLED', label: 'Dibatalkan (Ditiadakan)', dot: 'bg-rose-600', icon: <CalendarX2 className="w-4 h-4" />, tint: 'rose' },
        { value: 'MAKEUP_CLASS', label: 'Kelas Pengganti', dot: 'bg-primary-600', icon: <CalendarPlus className="w-4 h-4" />, tint: 'primary' },
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto scroll-smooth-panel bg-overlay backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Kelola Jadwal">
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl max-w-lg w-full shadow-modal relative border border-line animate-scale-in my-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-line-soft">
                    <div className="flex items-center gap-3">
                        <span className="grid place-items-center w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 text-white shrink-0 shadow-btn">
                            <Video className="w-5 h-5" />
                        </span>
                        <div>
                            <h3 className="font-extrabold text-ink text-base tracking-tight leading-tight">Emergency Override</h3>
                            <p className="text-xs text-ink-soft">Switch daring Zoom/Meet atau reschedule jadwal</p>
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

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Pilih Jadwal Mata Kuliah */}
                    <Field label="Pilih Jadwal Mata Kuliah" required error={errors.schedule_id}>
                        <select
                            value={data.schedule_id}
                            onChange={(e) => setData('schedule_id', e.target.value)}
                            className={inputCls}
                        >
                            {schedules.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.subject_name || s.subject?.name} ({s.day_name}, {s.time_range || `${s.start_time}-${s.end_time}`})
                                </option>
                            ))}
                        </select>
                    </Field>

                    {/* Tanggal Pertemuan */}
                    <Field label="Tanggal Pertemuan" required error={errors.original_date}>
                        <input
                            type="date"
                            value={data.original_date}
                            onChange={(e) => setData('original_date', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    {/* Kondisi / Status Pertemuan */}
                    <Field label="Kondisi Pertemuan" required>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Kondisi pertemuan">
                            {statusOptions.map((opt) => {
                                const selected = data.status === opt.value;
                                const tints = {
                                    purple: selected && 'border-purple-500 bg-purple-50 dark:bg-purple-500/15 text-purple-900 dark:text-purple-200',
                                    amber: selected && 'border-amber-500 bg-amber-50 dark:bg-amber-500/15 text-amber-900 dark:text-amber-200',
                                    rose: selected && 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-900 dark:text-rose-200',
                                    primary: selected && 'border-primary-500 bg-primary-50 dark:bg-primary-500/15 text-primary-900 dark:text-primary-200',
                                };
                                return (
                                    <label
                                        key={opt.value}
                                        className={`relative flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer text-xs font-semibold transition-all ${
                                            selected
                                                ? `ring-2 ring-offset-1 ring-transparent ${tints[opt.tint] || ''}`
                                                : 'border-line text-ink-soft hover:border-ink-faint/40 hover:bg-elevated'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={opt.value}
                                            checked={selected}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="peer sr-only"
                                        />
                                        <span className={`mt-px shrink-0 ${selected ? '' : 'opacity-60'}`}>{opt.icon}</span>
                                        <span>{opt.label}</span>
                                        {selected && (
                                            <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${opt.dot}`}></span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </Field>

                    {/* Jika Online Meeting */}
                    {data.status === 'ONLINE' && (
                        <div className="space-y-3 p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/30 animate-fade-in-up">
                            <Field label="Link Pertemuan (Zoom / Google Meet)" required tinted error={errors.meeting_url}>
                                <input
                                    type="url"
                                    placeholder="https://ugm-id.zoom.us/j/..."
                                    value={data.meeting_url}
                                    onChange={(e) => setData('meeting_url', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>

                            <Field label="Passcode Meeting (Opsional)" tinted>
                                <input
                                    type="text"
                                    placeholder="123456"
                                    value={data.meeting_passcode}
                                    onChange={(e) => setData('meeting_passcode', e.target.value)}
                                    className={inputCls}
                                />
                            </Field>
                        </div>
                    )}

                    {/* Jika Reschedule atau Makeup Class */}
                    {(data.status === 'RESCHEDULED' || data.status === 'MAKEUP_CLASS') && (
                        <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 animate-fade-in-up">
                            <div className="grid grid-cols-2 gap-2.5">
                                <Field label="Tanggal Baru" tinted>
                                    <input type="date" value={data.new_date} onChange={(e) => setData('new_date', e.target.value)} className={inputCls} />
                                </Field>
                                <Field label="Ruang Baru" tinted>
                                    <input type="text" placeholder="Lab Jaringan 2" value={data.new_room} onChange={(e) => setData('new_room', e.target.value)} className={inputCls} />
                                </Field>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                                <Field label="Jam Mulai Baru" tinted>
                                    <input type="time" value={data.new_start_time} onChange={(e) => setData('new_start_time', e.target.value)} className={inputCls} />
                                </Field>
                                <Field label="Jam Selesai Baru" tinted>
                                    <input type="time" value={data.new_end_time} onChange={(e) => setData('new_end_time', e.target.value)} className={inputCls} />
                                </Field>
                            </div>
                        </div>
                    )}

                    {/* Catatan / Alasan Dosen */}
                    <Field label="Catatan / Instruksi Dosen" error={errors.reason}>
                        <textarea
                            rows="2"
                            placeholder="Contoh: Dosen bertugas ke luar kota, kuliah via Zoom. Wajib on-cam."
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            className={inputCls}
                        />
                    </Field>

                    {/* Notifikasi WhatsApp */}
                    <label className="flex items-center justify-between gap-3 cursor-pointer select-none bg-emerald-50/80 dark:bg-emerald-500/10 p-3.5 rounded-2xl border border-emerald-200/70 dark:border-emerald-500/30 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/15">
                        <span className="flex items-center gap-2.5 min-w-0">
                            <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="min-w-0">
                                <span className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">Blast WhatsApp &amp; @everyone</span>
                                <span className="block text-[11px] text-emerald-700/90 dark:text-emerald-400/90 truncate">Otomatis tag seluruh member grup WA</span>
                            </span>
                        </span>
                        <ToggleInput checked={data.send_waha_blast} onChange={(v) => setData('send_waha_blast', v)} tone="emerald" />
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
                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold shadow-btn transition-all active:scale-95 disabled:opacity-60"
                        >
                            {processing ? (
                                'Menyimpan...'
                            ) : (
                                <>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Simpan &amp; Blast
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const inputCls = 'w-full rounded-xl border border-line bg-elevated px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-primary-500 focus:bg-card focus:ring-4 focus:ring-primary-500/15 transition-all';

function Field({ label, required = false, error, tinted = false, children }) {
    return (
        <div>
            {label && (
                <label className={`block text-xs font-bold mb-1.5 ${tinted ? 'text-purple-900 dark:text-purple-300' : 'text-ink-soft'}`}>
                    {label} {required && <span className="text-cancelled">*</span>}
                </label>
            )}
            {children}
            {error && <p className="text-xs text-cancelled mt-1.5 font-medium" role="alert">{error}</p>}
        </div>
    );
}

function ToggleInput({ checked, onChange, tone = 'emerald' }) {
    const tones = {
        emerald: checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600',
    };
    return (
        <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${tones[tone]}`}>
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
