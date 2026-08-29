import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Ya, Lanjutkan', onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in-up" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-sm bg-card rounded-3xl border border-line shadow-modal p-5 animate-scale-in">
                <div className="flex items-start gap-3 mb-4">
                    <span className="grid place-items-center w-10 h-10 rounded-2xl bg-cancelled-bg text-cancelled shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                        <h3 className="font-extrabold text-ink text-sm tracking-tight">{title}</h3>
                        <p className="text-xs text-ink-soft mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-full bg-elevated text-ink-soft text-xs font-bold border border-line hover:text-ink transition-colors">
                        Batal
                    </button>
                    <button onClick={onConfirm} className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-bold shadow-btn transition-all active:scale-[0.98]">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
