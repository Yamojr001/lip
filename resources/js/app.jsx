import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';

const appName = import.meta.env.VITE_APP_NAME || 'Lafiyar Iyali Project';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <StrictMode>
                <LanguageProvider>
                    <App {...props} />
                </LanguageProvider>
            </StrictMode>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
