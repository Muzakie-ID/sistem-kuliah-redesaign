import React from 'react';
import { Video, MapPin, User, Clock, Info, CalendarClock, CalendarX2, Pencil, Trash2 } from 'lucide-react';
import Badge from './Badge';

/**
 * Card jadwal tunggal. Dipakai di Dashboard dan Schedules.
 * Status dibaca lewat rail berwarna di sisi kiri + badge.
 */
export default function ScheduleCard({ schedule, onManage, manageLabel = 'Edit Status', onEdit, onDelete }) {
    const isOnline = schedule.status === 'ONLINE';
    const isRescheduled = schedule.status === 'RESCHEDULED' || schedule.status === 'MAKEUP_CLASS';
    const isCancelled = schedule.status === 'CANCELLED';

    const meetingUrl = schedule.meeting_url || schedule.override?.meeting_url;
    const meetingPasscode = schedule.meeting_passcode || schedule.override?.meeting_passcode;
    const reason = schedule.reason || schedule.override?.reason;

    // Info tanggal perubahan: kartu master yang digeser / kartu kelas pengganti
    const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null;
    const movedTo = !schedule.is_makeup && schedule.override?.new_date ? fmt(schedule.override.new_date) : null;
    const makeupFrom = schedule.is_makeup && schedule.override?.original_date ? fmt(schedule.override.original_date) : null;

    const railClass = isOnline
        ? 'from-purple-500 to-violet-400'
        : isRescheduled
        ? 'from-amber-500 to-orange-400'
        : isCancelled
        ? 'from-rose-500 to-rose-400'
        : 'from-primary-500 to-indigo-400';

    return (
        <article className={`relative overflow-hidden rounded-3xl border p-4 pl-5 transition-all shadow-card bg-card ${
            isCancelled ? 'opacity-60 border-line' : 'border-line/70 hover:shadow-card-hover hover:-translate-y-0.5'
        }`}>
            {/* Left status rail */}
            <span className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${railClass}`} aria-hidden="true"></span>

            <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-wrap gap-y-1">
                    {isOnline && <Badge variant="online"><Video className="w-3 h-3 mr-1" /> DARING (ZOOM/MEET)</Badge>}
                    {isRescheduled && <Badge variant="rescheduled"><CalendarClock className="w-3 h-3 mr-1" /> PERUBAHAN JADWAL</Badge>}
                    {isCancelled && <Badge variant="cancelled"><CalendarX2 className="w-3 h-3 mr-1" /> DIBATALKAN</Badge>}
                    {!isOnline && !isRescheduled && !isCancelled && (
                        <Badge variant={schedule.type === 'THEORY' ? 'theory' : 'practicum'}>
                            {schedule.type === 'THEORY' ? 'Teori BB' : `Praktikum ${schedule.target_group.replace('_PRACTICUM', '')}`}
                        </Badge>
                    )}
                </div>

                <div className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-ink bg-elevated/80 px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                    <span>{schedule.start_time} - {schedule.end_time}</span>
                </div>
            </div>

            <h4 className="font-bold text-ink text-[15px] leading-tight mb-2.5 tracking-tight">
                {schedule.subject_name}
            </h4>

            <div className="space-y-1.5 text-xs text-ink-soft mb-3">
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                    <span>{schedule.lecturer_name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                    {isOnline ? (
                        <span className="text-purple-700 dark:text-purple-300 font-semibold">Daring via Zoom / GMeet — tidak perlu ke ruang fisik</span>
                    ) : (
                        <span>{schedule.room}</span>
                    )}
                </div>

                {movedTo && (
                    <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-amber-700 dark:text-amber-300">Digeser ke {movedTo}</span>
                    </div>
                )}

                {makeupFrom && (
                    <div className="flex items-center gap-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-amber-700 dark:text-amber-300">Kelas pengganti dari jadwal {makeupFrom}</span>
                    </div>
                )}

                {reason && (
                    <div className="mt-2 flex items-start gap-1.5 p-2.5 rounded-xl bg-elevated/70 border border-line-soft text-xs text-ink-soft leading-relaxed">
                        <Info className="w-3.5 h-3.5 mt-px shrink-0 text-primary-500" />
                        <span><strong className="text-ink">Catatan:</strong> {reason}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 mt-1 border-t border-line/50">
                {isOnline && meetingUrl ? (
                    <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.97]"
                    >
                        <Video className="w-4 h-4" />
                        <span>Gabung Meeting{meetingPasscode ? ` • Pass: ${meetingPasscode}` : ''}</span>
                    </a>
                ) : (
                    <span className="text-xs text-ink-faint">Kuliah Tatap Muka Fisik</span>
                )}

                {onManage && (
                    <div className="flex items-center gap-1">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                aria-label="Edit jadwal"
                                className="p-2 rounded-full text-ink-faint hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                aria-label="Hapus jadwal"
                                className="p-2 rounded-full text-ink-faint hover:text-cancelled hover:bg-cancelled/10 transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={() => onManage(schedule.id)}
                            className="text-xs font-bold text-ink-soft hover:text-online px-3 py-1.5 rounded-full hover:bg-online-bg transition-colors"
                        >
                            {manageLabel}
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
