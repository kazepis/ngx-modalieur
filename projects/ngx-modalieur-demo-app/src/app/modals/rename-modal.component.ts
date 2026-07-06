import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalContent } from 'ngx-modalieur';

export interface RenameInput {
  currentName: string;
}

export interface RenameResult {
  newName: string;
}

/** Demo: input and output — `ModalContent<RenameInput, RenameResult>`. */
@Component({
  selector: 'app-rename-modal',
  imports: [FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title" id="rename-modal-title">Rename</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body" aria-labelledby="rename-modal-title">
      <label class="form-label" for="rename-input">New name</label>
      <input
        id="rename-input"
        class="form-control"
        type="text"
        [ngModel]="newName()"
        (ngModelChange)="newName.set($event)"
        (keyup.enter)="submit()"
        cdkFocusInitial
      />
      <p class="form-text mb-0">Current: {{ data.currentName }}</p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" [disabled]="!newName().trim()" (click)="submit()">Save</button>
      <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
    </div>
  `
})
export class RenameModalComponent extends ModalContent<RenameInput, RenameResult> {
  protected readonly newName = signal(this.data.currentName);

  protected submit(): void {
    const trimmed = this.newName().trim();
    if (trimmed) {
      this.respondWithData({ newName: trimmed });
    }
  }
}
