import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

/** Demo: no input, no output — `ModalContent<void, never>`. */
@Component({
  selector: 'app-ack-modal',
  standalone: true,
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="ack-modal-title">Notice</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body" aria-labelledby="ack-modal-title">
      <p class="mb-0">This modal takes no input and returns no data — only a <code>ModalResult</code>.</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="cancel()">Dismiss</button>
      <button type="button" class="btn btn-primary" (click)="ok()">OK</button>
    </div>
  `
})
export class AckModalComponent extends ModalContent<void, never> {}
