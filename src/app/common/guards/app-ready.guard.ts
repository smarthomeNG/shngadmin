import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { of } from 'rxjs';
import { map, take, timeout } from 'rxjs/operators';
import { AppConfigService } from '../services/app-config.service';

/**
 * Delays route activation until the initial /api/server response has arrived.
 * Uses loginRequired !== null as the signal: APP_INITIALIZER calls
 * getServerBasicinfo() which always sets loginRequired (to false if the field
 * is absent), so this guard passes synchronously on every navigation after
 * bootstrap.  The 1 s fallback covers the rare case where the guard fires
 * before initialisation completes.
 *
 * NOTE: only placed on the top-level parent routes in app.routes.ts — child
 * routes must NOT repeat it or the wait multiplies with each route segment.
 */
export const appReadyGuard: CanActivateFn = () => {
  const appConfig = inject(AppConfigService);
  if (appConfig.snapshot.loginRequired !== null) {
    return true;
  }
  return appConfig.authReady$.pipe(
    timeout({ first: 1000, with: () => of(null) }),
    take(1),
    map(() => true),
  );
};
