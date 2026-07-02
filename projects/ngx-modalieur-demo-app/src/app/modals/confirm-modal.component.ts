import { A11yModule } from '@angular/cdk/a11y';
import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

import { SampleData } from './sample-data';

@Component({
  selector: 'app-confirm-modal',
  imports: [A11yModule],
  template: `
    <div cdkTrapFocus [cdkTrapFocusAutoCapture]="true">
      <div class="modal-header">
        <h5 class="modal-title">{{ data.title }}</h5>
        <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
      </div>
      <div class="modal-body">
        <p class="mb-0 text-break text-pre-line">{{ data.message }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="no()">No</button>
        <button type="button" class="btn btn-primary" (click)="yes()" cdkFocusInitial>Yes</button>
      </div>
    </div>
  `
})
export class ConfirmModalComponent extends ModalContent<SampleData, never> {}
