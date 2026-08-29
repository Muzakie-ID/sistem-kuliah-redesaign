import React, { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';

export default function CountdownTimer({ targetDate }) {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            timeLeft = { expired: true };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (timeLeft.expired) {
        return (
            <span className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-cancelled bg-cancelled-bg border border-cancelled-line px-2 py-1 rounded-full">
                <Hourglass className="w-3 h-3" />
                Habis
            </span>
        );
    }

    const { hours = 0, minutes = 0, seconds = 0 } = timeLeft;

    return (
        <span
            className="shrink-0 inline-flex items-center gap-1 font-mono text-[11px] font-bold text-cancelled bg-cancelled-bg border border-cancelled-line px-2 py-1 rounded-full tabular-nums"
            role="timer"
            aria-label={`Sisa waktu ${hours} jam ${minutes} menit ${seconds} detik`}
        >
            <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex w-2 h-2 rounded-full bg-cancelled"></span>
            </span>
            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
    );
}
