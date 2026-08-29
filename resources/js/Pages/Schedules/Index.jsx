import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import EmergencyOverrideModal from '../../Components/EmergencyOverrideModal';
import ScheduleCard from '../../Components/ScheduleCard';
import { CalendarDays, Coffee } from 'lucide-react';

export default function SchedulesIndex({ weeklySchedules = {}, currentDayOfWeek = 1, manageableSubjects = [], allSchedules = [] }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [selectedDay, setSelectedDay] = useState(currentDayOfWeek <= 6 ? currentDayOfWeek : 1);
    const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);

    const days = [
        { id: 1, name: 'Senin', short: 'Sen' },
        { id: 2, name: 'Selasa', short: 'Sel' },
        { id: 3, name: 'Rabu', short: 'Rab' },
        { id: 4, name: 'Kamis', short: 'Kam' },
        { id: 5, name: 'Jumat', short: 'Jum' },
        { id: 6, name: 'Sabtu', short: 'Sab' },
    ];

    const currentDaySchedules = weeklySchedules[selectedDay] || [];

    const openEmergencyModal = (scheduleId = null) => {
        setSelectedScheduleId(scheduleId);
        setIsEmergencyModalOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Jadwal Kuliah Mingguan" />

            <div className="mb-4">
                <h2 className="text-xl font-extrabold text-ink tracking-tight">Matriks Jadwal Mingguan</h2>
                <p className="text-xs text-ink-soft mt-0.5">
                    Jadwal kuliah Teori (BB) dan Praktikum Kloter <span className="font-bold text-primary-600 dark:text-primary-400">{user?.practicum_group}</span>
                </p>
            </div>

            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1 bg-elevated/80 p-1.5 rounded-2xl mb-5 overflow-x-auto" role="tablist" aria-label="Pilih hari">
                {days.map((day) => {
                    const isSelected = selectedDay === day.id;
                    const isToday = currentDayOfWeek === day.id;

                    return (
                        <button
                            key={day.id}
                            role="tab"
                            aria-selected={isSelected}
                            onClick={() => setSelectedDay(day.id)}
                            className={`relative flex-1 min-w-[52px] py-2 px-1 rounded-xl text-center transition-all ${
                                isSelected
                                    ? 'bg-card shadow-btn ring-1 ring-line'
                                    : 'hover:bg-card/60'
                            }`}
                        >
                            <span className={`block text-xs ${isSelected ? 'font-extrabold text-primary-600 dark:text-primary-400' : 'font-medium text-ink-soft hover:text-ink'}`}>
                                {day.short}
                            </span>
                            {isToday && (
                                <span className="absolute -top-0.5 right-1 flex items-center justify-center">
                                    <span className="absolute w-3 h-3 rounded-full bg-primary-500/40 animate-ping"></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Day Header Info */}
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="inline-flex items-center gap-1.5 font-extrabold text-ink text-sm">
                    <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    Hari {days.find(d => d.id === selectedDay)?.name}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-elevated text-ink-soft">
                    {currentDaySchedules.length} Kelas
                </span>
            </div>

            {/* Schedule Cards */}
            {currentDaySchedules.length === 0 ? (
                <div className="rounded-3xl p-10 text-center bg-card border border-dashed border-line/60 animate-fade-in-up">
                    <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-elevated text-ink-faint mb-3">
                        <Coffee className="w-7 h-7" />
                    </span>
                    <h4 className="font-bold text-ink text-sm">Bebas Kelas di Hari Ini</h4>
                    <p className="text-xs text-ink-faint mt-1">Silakan pilih hari lain pada tab di atas.</p>
                </div>
            ) : (
                <div className="space-y-3.5 animate-fade-in-up">
                    {currentDaySchedules.map((schedule) => (
                        <ScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            onManage={user?.is_pj ? (id) => openEmergencyModal(id) : null}
                            manageLabel="Kelola / Override"
                        />
                    ))}
                </div>
            )}

            {/* Emergency Modal */}
            <EmergencyOverrideModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                schedules={allSchedules.length > 0 ? allSchedules : currentDaySchedules}
                defaultScheduleId={selectedScheduleId}
            />
        </AuthenticatedLayout>
    );
}
