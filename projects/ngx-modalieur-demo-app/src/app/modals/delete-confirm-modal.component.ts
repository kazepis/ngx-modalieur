import { Component } from '@angular/core';
import { ModalContent } from 'ngx-modalieur';

export interface DeleteConfirmInput {
  itemName: string;
}

/** Demo: input only — `ModalContent<DeleteConfirmInput, never>`. */
@Component({
  selector: 'app-delete-confirm-modal',
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="delete-confirm-title">Delete item?</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body" aria-labelledby="delete-confirm-title">
      <p class="mb-0">
        Delete <strong>{{ data.itemName }}</strong
        >? This cannot be undone.
      </p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-danger" (click)="yes()">Yes, delete</button>
      <button type="button" class="btn btn-secondary" (click)="no()" cdkFocusInitial>No</button>
    </div>
  `
})
export class DeleteConfirmModalComponent extends ModalContent<DeleteConfirmInput, never> {}
