import { InjectionToken } from '@angular/core';

/**
 * Injection token used to read the `data` passed to a modal via
 * `ModalConfig.data`. This is a library-owned token; the underlying CDK
 * `DIALOG_DATA` is never exposed.
 *
 * @example
 * ```ts
 * private readonly data = inject<MyData>(MODAL_DATA);
 * ```
 */
export const MODAL_DATA = new InjectionToken<unknown>('ngx-modalieur.MODAL_DATA');
