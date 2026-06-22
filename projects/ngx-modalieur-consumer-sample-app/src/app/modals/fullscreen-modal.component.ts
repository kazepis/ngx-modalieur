import { Component, inject } from '@angular/core';
import { MODAL_DATA, ModalContent } from '@kazepis/ngx-modalieur';

import { SampleData } from './sample-data';

/**
 * A true full-screen popup: opened with `unstyled: true` (no Bootstrap
 * container) and styled by the component itself to fill the viewport and
 * center its content.
 */
@Component({
  selector: 'app-fullscreen-modal',
  standalone: true,
  template: `
    <div class="fs-popup">
      <button type="button" class="fs-close" aria-label="Close" (click)="cancel()">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M6 6 L18 18 M18 6 L6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <div class="fs-content">
        <h1>{{ data.title }}</h1>
        <p>{{ data.message }}</p>
        <div class="fs-actions">
          <button type="button" class="fs-btn" (click)="cancel()">Close</button>
          <button type="button" class="fs-btn primary" (click)="ok()">OK</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .fs-popup {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%);
        color: #fff;
        text-align: center;
      }
      .fs-content {
        max-width: 640px;
      }
      .fs-content h1 {
        font-size: clamp(2rem, 5vw, 3.5rem);
        font-weight: 700;
        margin: 0 0 1rem;
      }
      .fs-content p {
        font-size: 1.25rem;
        opacity: 0.85;
        margin: 0;
      }
      .fs-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2.5rem;
      }
      .fs-btn {
        padding: 0.6rem 1.6rem;
        font-size: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.6);
        border-radius: 999px;
        background: transparent;
        color: inherit;
        cursor: pointer;
      }
      .fs-btn.primary {
        background: #fff;
        border-color: #fff;
        color: #1e3a8a;
        font-weight: 600;
      }
      .fs-close {
        position: absolute;
        top: 1.5rem;
        right: 1.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        padding: 0;
        border: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        cursor: pointer;
      }
      .fs-close svg {
        display: block;
      }
    `,
  ],
})
export class FullscreenModalComponent extends ModalContent {
  protected readonly data = inject<SampleData>(MODAL_DATA);
}
