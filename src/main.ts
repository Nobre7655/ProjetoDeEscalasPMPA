import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAnimations(),
    providePrimeNG({
      theme: { preset: Lara },
    }),
  ],
}).catch((err) => console.error(err));