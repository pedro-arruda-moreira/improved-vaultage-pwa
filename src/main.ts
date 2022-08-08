import { enableProdMode, InjectionToken } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { start as detectFeatures } from './misc/FeatureDetector';
import { start as limitTextSelection } from './misc/TextSelectionController';


detectFeatures();
limitTextSelection();

if (environment.production !== false) {
  enableProdMode();
}
platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));