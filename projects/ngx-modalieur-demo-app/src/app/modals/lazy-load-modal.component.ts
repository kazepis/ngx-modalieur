import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

/** Demo: lazy-loaded modal — opened only via dynamic import(). */
@Component({
  selector: 'app-lazy-load-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="lazy-load-modal-title">Loaded on demand</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body" aria-labelledby="lazy-load-modal-title">
      <p class="mb-0">
        This modal was loaded on demand via <code>import()</code> — it is not in the initial bundle.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" (click)="ok()">OK</button>
      <button type="button" class="btn btn-secondary" (click)="cancel()" cdkFocusInitial>Dismiss</button>
    </div>
  `
})
export class LazyLoadModalComponent extends ModalContent<void, never> {}
