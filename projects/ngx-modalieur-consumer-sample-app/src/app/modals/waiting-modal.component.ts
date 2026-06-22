import { Component, inject } from '@angular/core';
import { MODAL_DATA, ModalContent } from '@kazepis/ngx-modalieur';

import { SampleData } from './sample-data';

@Component({
  selector: 'app-waiting-modal',
  standalone: true,
  template: `
    <div class="modal-body text-center p-4">
      <div class="spinner-border text-primary mb-3" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mb-0">Working&hellip; this closes automatically.</p>
      <p class="mb-0">{{ data.title }}</p>
      <p class="mb-0">{{ data.message }}</p>
    </div>
  `,
})
export class WaitingModalComponent extends ModalContent {
  protected readonly data = inject<SampleData>(MODAL_DATA);
}
