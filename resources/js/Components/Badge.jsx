import React from 'react';

export default function Badge({ variant = 'default', children, className = '' }) {
    const variants = {
        default: 'bg-elevated text-ink-soft border-line',
        primary: 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-500/30',
        online: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 font-bold',
        rescheduled: 'bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 font-bold',
        cancelled: 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30 font-bold',
        makeup: 'bg-primary-100 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-500/30 font-bold',
        theory: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30',
        practicum: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
        urgent: 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/40 font-bold animate-pulse',
        warning: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
        safe: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 font-semibold',
        admin: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/40',
        pj: 'bg-primary-100 dark:bg-primary-500/20 text-primary-800 dark:text-primary-300 border-primary-200 dark:border-primary-500/40',
        student: 'bg-elevated text-ink-soft border-line',
    };

    const selectedVariant = variants[variant] || variants.default;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${selectedVariant} ${className}`}>
            {children}
        </span>
    );
}
