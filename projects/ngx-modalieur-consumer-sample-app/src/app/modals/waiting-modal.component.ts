import { Component } from '@angular/core';
import { ModalContent } from '@kazepis/ngx-modalieur';

@Component({
  selector: 'app-waiting-modal',
  standalone: true,
  template: `
    <div class="modal-body text-center p-4">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mb-0">Working&hellip; this closes automatically.</p>
    </div>
  `
})
export class WaitingModalComponent extends ModalContent {}
