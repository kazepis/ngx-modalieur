import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

export interface RatingResult {
  rating: number;
}

/** Demo: output only — `ModalContent<void, RatingResult>`. */
@Component({
  selector: 'app-rating-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="rating-modal-title">Rate this demo</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body" aria-labelledby="rating-modal-title">
      <p class="mb-3">How would you rate ngx-modalieur?</p>
      <div class="d-flex flex-wrap gap-2" role="group" aria-label="Rating">
        @for (star of ratings; track star) {
          <button type="button" class="btn btn-outline-primary" (click)="rate(star)">{{ star }} ★</button>
        }
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="cancel()" cdkFocusInitial>Skip</button>
    </div>
  `
})
export class RatingModalComponent extends ModalContent<void, RatingResult> {
  protected readonly ratings = [1, 2, 3, 4, 5] as const;

  protected rate(rating: number): void {
    this.respondWithData({ rating });
  }
}
