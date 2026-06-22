import { Component, inject, signal } from '@angular/core';
import { ModalieurService, ModalOutcome, ModalResult } from '@kazepis/ngx-modalieur';
import { concat, map, timer } from 'rxjs';

import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { FullscreenModalComponent } from './modals/fullscreen-modal.component';
import { NamePromptModalComponent } from './modals/name-prompt-modal.component';
import { PlainModalComponent } from './modals/plain-modal.component';
import { WaitingModalComponent } from './modals/waiting-modal.component';

interface DemoExample {
  id: string;
  label: string;
  btnClass: string;
  code: string;
  run: () => void;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
})
export class App {
  private readonly modalieur = inject(ModalieurService);

  protected readonly lastOutcome = signal('—');

  protected readonly examples: DemoExample[] = [
    {
      id: 'confirm',
      label: 'Confirm (Yes / No)',
      btnClass: 'btn-primary',
      code: `this.modalieur
  .show(ConfirmModalComponent, {
    data: { title: 'Confirm', message: 'Do you want to continue?' },
  })
  .subscribe((outcome) => {
    if (outcome.result === ModalResult.Yes) {
      // ...
    }
  });`,
      run: () => this.openConfirm(),
    },
    {
      id: 'large',
      label: 'Large size',
      btnClass: 'btn-outline-primary',
      code: `this.modalieur
  .show(ConfirmModalComponent, { size: 'lg', data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openLarge(),
    },
    {
      id: 'fullscreen',
      label: 'Fullscreen',
      btnClass: 'btn-outline-primary',
      code: `// Custom full-screen popup (unstyled = no Bootstrap classes).
this.modalieur
  .show(FullscreenModalComponent, { unstyled: true, data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openFullscreen(),
    },
    {
      id: 'static',
      label: 'Non-dismissible',
      btnClass: 'btn-outline-primary',
      code: `// Backdrop click + Escape will not close it.
this.modalieur
  .show(ConfirmModalComponent, { dismissible: false, data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openStatic(),
    },
    {
      id: 'until',
      label: 'Auto-close (showUntil)',
      btnClass: 'btn-outline-primary',
      code: `// Closes when the observable emits anything.
this.modalieur
  .showUntil(WaitingModalComponent, timer(2000))
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openWaiting(),
    },
    {
      id: 'condition',
      label: 'Auto-close on condition (showUntilCondition)',
      btnClass: 'btn-outline-primary',
      code: `// Closes on the first TRUTHY emission.
this.modalieur
  .showUntilCondition(WaitingModalComponent, ready$)
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openConditional(),
    },
    {
      id: 'data',
      label: 'Returns data',
      btnClass: 'btn-outline-primary',
      code: `// Result-data type is inferred from the component.
this.modalieur.show(NamePromptModalComponent).subscribe((outcome) => {
  if (outcome.result === ModalResult.Data) {
    console.log(outcome.data?.name);
  }
});`,
      run: () => this.openNamePrompt(),
    },
    {
      id: 'ref',
      label: 'Programmatic control (showAndReturnRef)',
      btnClass: 'btn-outline-primary',
      code: `// Hold the ref, run async work, then close it yourself with a result + data.
const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
  dismissible: false,
});
ref.closed$.subscribe((outcome) => { /* ... */ });

save().then((id) => ref.close(ModalResult.Ok, { savedId: id }));`,
      run: () => this.openProgress(),
    },
    {
      id: 'unstyled',
      label: 'No Bootstrap (unstyled)',
      btnClass: 'btn-outline-secondary',
      code: `// No Bootstrap container; the component brings its own styles.
this.modalieur
  .show(PlainModalComponent, { unstyled: true })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openUnstyled(),
    },
  ];

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

  protected openFullscreen(): void {
    // A custom, unstyled full-screen popup (no Bootstrap modal classes).
    this.modalieur
      .show(FullscreenModalComponent, {
        unstyled: true,
        data: { title: 'Fullscreen popup', message: 'A custom full-screen modal, centered.' },
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
        data: {
          title: 'Auto-close',
          message: 'This modal closes when the observable emits anything.',
        },
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
        data: {
          title: 'Auto-close',
          message: 'This modal closes when the condition emits true.',
        },
      })
      .subscribe((outcome) => this.report(outcome));
  }

  protected openNamePrompt(): void {
    // The result-data type (NamePromptResult) is inferred from the component.
    this.modalieur.show(NamePromptModalComponent).subscribe((outcome) => {
      if (outcome.result === ModalResult.Data) {
        console.log(outcome.data?.name);
      }

      this.report(outcome);
    });
  }

  protected openProgress(): void {
    // Show a blocking modal, then close it from imperative async code with a result + data.
    const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
      dismissible: false,
      data: {
        title: 'Saving…',
        message: 'This modal closes when the save completes.',
      },
    });
    ref.closed$.subscribe((outcome) => this.report(outcome));
    setTimeout(() => ref.close(ModalResult.Ok, { savedId: 42 }), 2000);
  }

  protected openUnstyled(): void {
    // No Bootstrap: the component brings its own styles.
    this.modalieur
      .show(PlainModalComponent, { unstyled: true })
      .subscribe((outcome) => this.report(outcome));
  }

  private report(outcome: ModalOutcome): void {
    const label = ModalResult[outcome.result];
    this.lastOutcome.set(
      outcome.data ? `ModalResult: ${label} - Data: ${JSON.stringify(outcome.data)}` : label,
    );
  }
}
