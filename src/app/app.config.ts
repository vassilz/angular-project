import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp } from '@angular/fire/app';

import { routes } from './app.routes';
import { initializeApp } from 'firebase/app';
import { environment } from '../environments/environment';
import { provideDatabase } from '@angular/fire/database';
import { getDatabase } from 'firebase/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase()),
  ],
};
