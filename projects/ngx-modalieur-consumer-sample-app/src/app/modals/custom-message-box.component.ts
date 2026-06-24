import { Component } from '@angular/core';
import { MessageBoxDialog, ModalContent } from 'ngx-modalieur';

/**
 * Demonstrates `MessageBoxDialog` with content projection: the header, body and
 * footer are fully provided by this component, wired to its own close helpers.
 */
@Component({
  selector: 'app-custom-message-box',
  standalone: true,
  imports: [MessageBoxDialog],
  template: `
    <mdlr-message-box>
      <div mbHeader class="d-flex align-items-center gap-2">
        <span class="fs-4">🎉</span>
        <h5 class="modal-title mb-0">Custom projected header</h5>
      </div>
      <div mbBody>
        <p class="mb-2">Header, body and footer are fully projected.</p>
        <ul class="mb-0">
          <li>Any markup you like</li>
          <li>Wired to your own buttons</li>
        </ul>
      </div>
      <div mbFooter class="d-flex gap-2">
        <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Dismiss</button>
        <button type="button" class="btn btn-success" (click)="ok()">Got it</button>
      </div>
    </mdlr-message-box>
  `
})
export class CustomMessageBoxComponent extends ModalContent {}
