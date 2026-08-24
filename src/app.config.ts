import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { errorInterceptor } from './app/core/http/error.interceptor';

registerLocaleData(localeFr);

/**
 * Palette de marque GestResu (bleu), appliquée par défaut à l'ensemble
 * de l'application. Point de vérité unique du thème (docs/ANGULAR-GUIDELINES.md §9).
 */
const GestResuPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}'
                },
                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.700}',
                    focusColor: '{primary.800}'
                }
            },
            dark: {
                primary: {
                    color: '{primary.400}',
                    contrastColor: '{surface.900}',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}'
                },
                highlight: {
                    background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                    focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                    color: 'rgba(255,255,255,.87)',
                    focusColor: 'rgba(255,255,255,.87)'
                }
            }
        }
    }
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
            withEnabledBlockingInitialNavigation(),
            withComponentInputBinding()
        ),
        provideHttpClient(
            withFetch(),
            withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
            withInterceptors([errorInterceptor])
        ),
        provideZonelessChangeDetection(),
        providePrimeNG({ theme: { preset: GestResuPreset, options: { darkModeSelector: '.app-dark' } } }),
        MessageService,
        ConfirmationService,
        { provide: LOCALE_ID, useValue: 'fr-FR' }
    ]
};
