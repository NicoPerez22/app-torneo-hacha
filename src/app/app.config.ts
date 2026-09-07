import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { provideToastr } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideNzI18n, es_ES } from 'ng-zorro-antd/i18n';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NgxSpinnerModule } from 'ngx-spinner';

import { routes } from './app.routes';
import { ROOT_REDUCERS } from './state/app.state';
import { jwtInterceptor } from './shared/Interceptor/jwt.interceptor';
import { loadingInterceptor } from './shared/Interceptor/loading.interceptor';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor, loadingInterceptor])),
    provideAnimations(),
    provideToastr(),
    provideNzI18n(es_ES),
    provideStore(ROOT_REDUCERS),
    provideStoreDevtools({ name: 'TEST' }),
    CookieService,
    importProvidersFrom(
      NzModalModule,
      NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    ),
  ],
};
