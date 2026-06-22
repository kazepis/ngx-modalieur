import { Component, inject, signal } from '@angular/core';
import { ModalieurService, ModalOutcome, ModalResult } from '@kazepis/ngx-modalieur';
import { timer } from 'rxjs';

import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { NamePromptModalComponent, NamePromptResult } from './modals/name-prompt-modal.component';
import { WaitingModalComponent } from './modals/waiting-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html'
})
export class App {
  private readonly modal = inject(ModalieurService);

  protected readonly lastOutcome = signal('—');

  protected openConfirm(): void {
    this.modal
      .show(ConfirmModalComponent, { data: { title: 'Confirm', message: 'Do you want to continue?' } })
      .subscribe(outcome => this.report(outcome));
  }

  protected openLarge(): void {
    this.modal
      .show(ConfirmModalComponent, {
        size: 'lg',
        data: { title: 'Large modal', message: 'This dialog uses the .modal-lg size.' }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openStatic(): void {
    this.modal
      .show(ConfirmModalComponent, {
        dismissible: false,
        data: { title: 'Non-dismissible', message: 'Backdrop and Escape will not close this.' }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openWaiting(): void {
    this.modal.showUntil(WaitingModalComponent, timer(2000)).subscribe(outcome => this.report(outcome));
  }

  protected openNamePrompt(): void {
    this.modal
      .show<NamePromptModalComponent, NamePromptResult>(NamePromptModalComponent)
      .subscribe(outcome => this.report(outcome));
  }

  private report(outcome: ModalOutcome): void {
    const label = ModalResult[outcome.result];
    this.lastOutcome.set(outcome.data ? `${label} - ${JSON.stringify(outcome.data)}` : label);
  }
}
