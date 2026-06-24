import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

/**
 * Demonstrates `unstyled: true`: no Bootstrap, no `.modal` wrapper. The
 * component provides its own markup and styles; the library still gives it the
 * backdrop, focus trap, Escape/backdrop dismissal and the reactive result.
 */
@Component({
  selector: 'app-plain-modal',
  standalone: true,
  template: `
    <div class="plain-dialog">
      <h2>Plain modal</h2>
      <p>No Bootstrap here — this uses <code>unstyled: true</code> and the component's own CSS.</p>
      <div class="plain-actions">
        <button type="button" (click)="cancel()">Close</button>
        <button type="button" class="primary" (click)="ok()">OK</button>
      </div>
    </div>
  `,
  styles: [
    `
      .plain-dialog {
        width: 360px;
        max-width: 90vw;
        padding: 1.5rem;
        border-radius: 12px;
        background: #1f2937;
        color: #f9fafb;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        font-family: system-ui, sans-serif;
      }
      .plain-dialog h2 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
      }
      .plain-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }
      .plain-actions button {
        padding: 0.4rem 0.9rem;
        border: 1px solid #4b5563;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .plain-actions button.primary {
        background: #2563eb;
        border-color: #2563eb;
      }
    `
  ]
})
export class PlainModalComponent extends ModalContent {}
