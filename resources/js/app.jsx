import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// ponytail: toast DOM imperatif, bukan state React — networkError terjadi di luar tree komponen.
// Upgrade path: pindah ke context/toast library jika butuh notifikasi global lain.
router.on('networkError', () => {
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-cancelled text-white text-xs font-bold shadow-card animate-fade-in-up';
    el.setAttribute('role', 'alert');
    el.textContent = 'Koneksi ke server terputus. Pastikan server berjalan, lalu coba lagi.';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 6000);
});

const appName = import.meta.env.VITE_APP_NAME || 'Portal Kelas & Praktikum';

// Safe route fallback
if (typeof window !== 'undefined' && typeof window.route === 'undefined') {
    const routeMap = {
        'login': '/login',
        'logout': '/logout',
        'auth.check-niu': '/auth/check-niu',
        'auth.activate': '/auth/activate',
        'auth.login': '/auth/login',
        'dashboard': '/dashboard',
        'schedules.index': '/schedules',
        'schedules.override': '/schedules/override',
        'tasks.index': '/tasks',
        'tasks.store': '/tasks',
        'admin.index': '/admin',
        'admin.users.reset-pin': '/admin/users/reset-pin',
        'admin.waha.test-blast': '/admin/waha/test-blast',
    };
    window.route = (name, params) => {
        if (name === 'tasks.toggle') return `/tasks/${params}/toggle`;
        return routeMap[name] || `/${name.replace(/\./g, '/')}`;
    };
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    // Smooth scroll: halaman baru mulai dari atas dengan halus, back/forward memulihkan posisi scroll
    scroll: {
        reset: true,
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#2563eb',
        showSpinner: true,
    },
});
