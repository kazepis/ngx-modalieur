import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';

import { ModalConfig } from './modal-config';

/** App-wide default `ModalConfig`, merged with (and overridden by) per-call config. */
export const MODALIEUR_CONFIG = new InjectionToken<ModalConfig>('ngx-modalieur.CONFIG');

/**
 * Registers ngx-modalieur defaults. Add to an application's providers to set
 * app-wide modal behavior, e.g. to make every modal non-dismissible:
 *
 * @example
 * ```ts
 * providers: [provideModalieur({ dismissible: false, size: 'lg' })]
 * ```
 */
export function provideModalieur(defaults?: ModalConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: MODALIEUR_CONFIG,
      useValue: defaults ?? {
        backdrop: true,
        centered: true,
        dismissible: true,
        scrollable: false,
        unstyled: false
      }
    }
  ]);
}
