import { InjectionToken } from '@angular/core';

import { ModalSize } from './modal-config';

/** Presentation options passed to the Bootstrap dialog container. */
export interface BootstrapModalOptions {
  size?: ModalSize;
  centered?: boolean;
  scrollable?: boolean;
}

/** Token used to provide `BootstrapModalOptions` to the dialog container. */
export const BOOTSTRAP_MODAL_OPTIONS = new InjectionToken<BootstrapModalOptions>(
  'ngx-modalieur.BOOTSTRAP_MODAL_OPTIONS'
);
