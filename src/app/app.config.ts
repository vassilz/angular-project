import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appInterceptor } from './app.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { getAuth, provideAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideHttpClient(withInterceptors([appInterceptor])),
    provideAnimations(),
  ],
};
