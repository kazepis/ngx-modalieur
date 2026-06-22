import { Component, inject, signal } from '@angular/core';
import { ModalieurService, ModalOutcome, ModalResult } from '@kazepis/ngx-modalieur';
import { concat, map, timer } from 'rxjs';

import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { NamePromptModalComponent } from './modals/name-prompt-modal.component';
import { WaitingModalComponent } from './modals/waiting-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  private readonly modalieur = inject(ModalieurService);

  protected readonly lastOutcome = signal('—');

  protected openConfirm(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: { title: 'Confirm', message: 'Do you want to continue?' },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openLarge(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'lg',
        data: { title: 'Large modal', message: 'This dialog uses the .modal-lg size.' },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openStatic(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        dismissible: false,
        data: { title: 'Non-dismissible', message: 'Backdrop and Escape will not close this.' },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openWaiting(): void {
    this.modalieur
      .showUntil(WaitingModalComponent, timer(2000), {
        data: { title: 'Waiting', message: 'This will close after 2 seconds.' },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openConditional(): void {
    // Emits a falsy value first (ignored), then a truthy value that closes the modal.
    const condition$ = concat(
      timer(1000).pipe(map(() => false)),
      timer(1500).pipe(map(() => true)),
    );
    this.modalieur
      .showUntilCondition(WaitingModalComponent, condition$, {
        data: { title: 'Conditional close', message: 'This will close after 2.5 seconds.' },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openNamePrompt(): void {
    // The result-data type (NamePromptResult) is inferred from the component.
    this.modalieur.show(NamePromptModalComponent).subscribe((outcome) => this.report(outcome));
  }

  private report(outcome: ModalOutcome): void {
    const label = ModalResult[outcome.result];
    this.lastOutcome.set(outcome.data ? `${label} - ${JSON.stringify(outcome.data)}` : label);
  }
}
