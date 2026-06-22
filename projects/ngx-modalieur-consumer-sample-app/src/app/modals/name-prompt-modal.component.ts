import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalContent } from '@kazepis/ngx-modalieur';

export interface NamePromptResult {
  name: string;
}

@Component({
  selector: 'app-name-prompt-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">What's your name?</h5>
      <button type="button" class="btn-close" aria-label="Close" (click)="cancel()"></button>
    </div>
    <div class="modal-body">
      <input class="form-control" placeholder="Type a name" [(ngModel)]="name" (keyup.enter)="submit()" />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="cancel()">Cancel</button>
      <button type="button" class="btn btn-primary" [disabled]="!name()" (click)="submit()">OK</button>
    </div>
  `
})
export class NamePromptModalComponent extends ModalContent<NamePromptResult> {
  protected readonly name = signal('');

  protected submit(): void {
    if (this.name()) {
      this.respondWithData({ name: this.name() });
    }
  }
}
