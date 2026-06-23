import { Component, inject } from '@angular/core';
import { MODAL_DATA, ModalContent } from '@kazepis/ngx-modalieur';

import { SampleData } from './sample-data';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ data.title }}</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body">
      <p class="mb-0">{{ data.message }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="no()">No</button>
      <button type="button" class="btn btn-primary" (click)="yes()">Yes</button>
    </div>
  `
})
export class ConfirmModalComponent extends ModalContent {
  protected readonly data = inject<SampleData>(MODAL_DATA);
}
