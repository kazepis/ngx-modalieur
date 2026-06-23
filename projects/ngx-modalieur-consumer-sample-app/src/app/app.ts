import { Component, inject, signal } from '@angular/core';
import { MessageBoxButtons, MessageBoxDialog, ModalieurService, ModalOutcome, ModalResult } from '@kazepis/ngx-modalieur';
import { concat, map, timer } from 'rxjs';

import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { CustomMessageBoxComponent } from './modals/custom-message-box.component';
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
  templateUrl: './app.html'
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
      run: () => this.openConfirm()
    },
    {
      id: 'large',
      label: 'Large size',
      btnClass: 'btn-outline-primary',
      code: `this.modalieur
  .show(ConfirmModalComponent, { size: 'lg', data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openLarge()
    },
    {
      id: 'fullscreen',
      label: 'Fullscreen',
      btnClass: 'btn-outline-primary',
      code: `// Custom full-screen popup (unstyled = no Bootstrap classes).
this.modalieur
  .show(FullscreenModalComponent, { unstyled: true, data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openFullscreen()
    },
    {
      id: 'static',
      label: 'Non-dismissible',
      btnClass: 'btn-outline-primary',
      code: `// Backdrop click + Escape will not close it.
this.modalieur
  .show(ConfirmModalComponent, { dismissible: false, data })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openStatic()
    },
    {
      id: 'until',
      label: 'Auto-close (showUntil)',
      btnClass: 'btn-outline-primary',
      code: `// Closes when the observable emits anything.
this.modalieur
  .showUntil(WaitingModalComponent, timer(2000))
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openWaiting()
    },
    {
      id: 'condition',
      label: 'Auto-close on condition (showUntilCondition)',
      btnClass: 'btn-outline-primary',
      code: `// Closes on the first TRUTHY emission.
this.modalieur
  .showUntilCondition(WaitingModalComponent, ready$)
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openConditional()
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
      run: () => this.openNamePrompt()
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
      run: () => this.openProgress()
    },
    {
      id: 'unstyled',
      label: 'No Bootstrap (unstyled)',
      btnClass: 'btn-outline-secondary',
      code: `// No Bootstrap container; the component brings its own styles.
this.modalieur
  .show(PlainModalComponent, { unstyled: true })
  .subscribe((outcome) => { /* ... */ });`,
      run: () => this.openUnstyled()
    },
    {
      id: 'mb-ok',
      label: 'MessageBox: OK',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'OK', message: '…', buttons: MessageBoxButtons.OK },
  })
  .subscribe((o) => { /* o.result === ModalResult.Ok */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.OK, 'OK', 'A single OK button.')
    },
    {
      id: 'mb-okcancel',
      label: 'MessageBox: OK / Cancel',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'Save?', message: '…', buttons: MessageBoxButtons.OKCancel },
  })
  .subscribe((o) => { /* Ok | Cancel */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.OKCancel, 'Save changes?', 'Proceed with saving?')
    },
    {
      id: 'mb-abortretryignore',
      label: 'MessageBox: Abort / Retry / Ignore',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.AbortRetryIgnore, /* ... */ },
  })
  .subscribe((o) => { /* Abort | Retry | Ignore */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.AbortRetryIgnore, 'Operation failed', 'What would you like to do?')
    },
    {
      id: 'mb-yesnocancel',
      label: 'MessageBox: Yes / No / Cancel',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.YesNoCancel, /* ... */ },
  })
  .subscribe((o) => { /* Yes | No | Cancel */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.YesNoCancel, 'Save before closing?', 'You have unsaved changes.')
    },
    {
      id: 'mb-yesno',
      label: 'MessageBox: Yes / No',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.YesNo, /* ... */ },
  })
  .subscribe((o) => { /* Yes | No */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.YesNo, 'Delete item?', 'This cannot be undone.')
    },
    {
      id: 'mb-retrycancel',
      label: 'MessageBox: Retry / Cancel',
      btnClass: 'btn-outline-dark',
      code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.RetryCancel, /* ... */ },
  })
  .subscribe((o) => { /* Retry | Cancel */ });`,
      run: () => this.openMessageBox(MessageBoxButtons.RetryCancel, 'Connection lost', 'Could not reach the server.')
    },
    {
      id: 'mb-projection',
      label: 'MessageBox: content projection',
      btnClass: 'btn-outline-dark',
      code: `// In your component's template:
<mdlr-message-box>
  <div mbHeader>…</div>
  <div mbBody>…</div>
  <div mbFooter class="d-flex gap-2">
    <button (click)="cancel()">Dismiss</button>
    <button (click)="ok()">Got it</button>
  </div>
</mdlr-message-box>

// Then open your wrapper component:
this.modalieur.show(CustomMessageBoxComponent).subscribe((o) => { /* ... */ });`,
      run: () => this.openCustomMessageBox()
    }
  ];

  protected openConfirm(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: { title: 'Confirm', message: 'Do you want to continue?' }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openLarge(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'lg',
        data: {
          title: 'Large modal',
          message: 'This dialog uses the .modal-lg size.'
        }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openFullscreen(): void {
    // A custom, unstyled full-screen popup (no Bootstrap modal classes).
    this.modalieur
      .show(FullscreenModalComponent, {
        unstyled: true,
        data: { title: 'Fullscreen popup', message: 'A custom full-screen modal, centered.' }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openStatic(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        dismissible: false,
        data: { title: 'Non-dismissible', message: 'Backdrop and Escape will not close this.' }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openWaiting(): void {
    this.modalieur
      .showUntil(WaitingModalComponent, timer(2000), {
        data: {
          title: 'Auto-close',
          message: 'This modal closes when the observable emits anything.'
        }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openConditional(): void {
    // Emits a falsy value first (ignored), then a truthy value that closes the modal.
    const condition$ = concat(timer(1000).pipe(map(() => false)), timer(1500).pipe(map(() => true)));
    this.modalieur
      .showUntilCondition(WaitingModalComponent, condition$, {
        data: {
          title: 'Auto-close',
          message: 'This modal closes when the condition emits true.'
        }
      })
      .subscribe(outcome => this.report(outcome));
  }

  protected openNamePrompt(): void {
    // The result-data type (NamePromptResult) is inferred from the component.
    this.modalieur.show(NamePromptModalComponent).subscribe(outcome => {
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
        message: 'This modal closes when the save completes.'
      }
    });
    ref.closed$.subscribe(outcome => this.report(outcome));
    setTimeout(() => ref.close(ModalResult.Ok, { savedId: 42 }), 2000);
  }

  protected openUnstyled(): void {
    // No Bootstrap: the component brings its own styles.
    this.modalieur.show(PlainModalComponent, { unstyled: true }).subscribe(outcome => this.report(outcome));
  }

  protected openMessageBox(buttons: MessageBoxButtons, title: string, message: string): void {
    this.modalieur.show(MessageBoxDialog, { data: { title, message, buttons } }).subscribe(outcome => this.report(outcome));
  }

  protected openCustomMessageBox(): void {
    this.modalieur.show(CustomMessageBoxComponent).subscribe(outcome => this.report(outcome));
  }

  private report(outcome: ModalOutcome): void {
    const label = ModalResult[outcome.result];
    this.lastOutcome.set(outcome.data ? `ModalResult: ${label} - Data: ${JSON.stringify(outcome.data)}` : label);
  }
}
