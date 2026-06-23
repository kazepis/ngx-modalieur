import { CdkDialogContainer } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';

import { MODALIEUR_CONFIG } from '../../provide-modalieur';

/**
 * Default dialog container that wraps the projected modal content in Bootstrap
 * 5.3 markup (`.modal-dialog > .modal-content`) so every modal looks like a
 * native Bootstrap modal. The consumer component only renders the inner
 * `.modal-header` / `.modal-body` / `.modal-footer`.
 */
@Component({
  selector: 'mdlr-bootstrap-dialog',
  standalone: true,
  imports: [CdkPortalOutlet],
  // The `.modal` wrapper is required: Bootstrap declares the `--bs-modal-*`
  // CSS variables (background, padding, width, etc.) on `.modal`, and provides
  // the full-screen context for `.modal-dialog` centering/sizing.
  template: `
    <div class="modal" tabindex="-1">
      <div
        class="modal-dialog"
        [class.modal-dialog-centered]="options.centered !== false"
        [class.modal-dialog-scrollable]="!!options.scrollable"
        [class.modal-sm]="options.size === 'sm'"
        [class.modal-lg]="options.size === 'lg'"
        [class.modal-xl]="options.size === 'xl'"
        [class.modal-fullscreen]="options.size === 'fullscreen'"
      >
        <div class="modal-content">
          <ng-template cdkPortalOutlet />
        </div>
      </div>
    </div>
  `,
  // The Bootstrap `.modal-*` classes are global; disable encapsulation so the
  // container does not scope them away.
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootstrapDialogContainer extends CdkDialogContainer {
  protected readonly options = inject(MODALIEUR_CONFIG, { optional: true }) ?? {};
}
