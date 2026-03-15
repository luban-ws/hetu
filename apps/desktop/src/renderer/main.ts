import 'zone.js'; // Use default Zone.js entry point
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@angular/compiler';

// Import styles
import './bootstrap.min.css';
import './styles.scss';
import './assets/icons.css';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
  preserveWhitespaces: false
}).catch(err => console.log(err));
