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
  section: string;
  label: string;
  btnClass: string;
  code: string;
  run: () => void;
}

interface DemoSection {
  title: string;
  examples: DemoExample[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html'
})
export class App {
  private readonly modalieur = inject(ModalieurService);

  protected readonly outcomes = signal<Record<string, string>>({});

  protected readonly sections: DemoSection[] = [
    {
      title: 'Setup',
      examples: [
        {
          id: 'setup',
          section: 'Setup',
          label: 'Setup (read only)',
          btnClass: 'btn-secondary',
          code: `// angular.json styles (published package):
"node_modules/bootstrap/dist/css/bootstrap.min.css",
"node_modules/@angular/cdk/overlay-prebuilt.css",
"node_modules/@kazepis/ngx-modalieur/styles/ngx-modalieur.css"

// This workspace uses dist/ngx-modalieur via tsconfig paths.

// app.config.ts
providers: [provideModalieur({ size: 'lg' })]  // per-call config overrides`,
          run: () => {}
        }
      ]
    },
    {
      title: 'Basics',
      examples: [
        {
          id: 'confirm',
          section: 'Basics',
          label: 'Confirm (Yes / No)',
          btnClass: 'btn-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, {
    data: { title: 'Confirm', message: 'Do you want to continue?' },
  })
  .subscribe((outcome) => {
    if (outcome.result === ModalResult.Yes) { /* ... */ }
  });`,
          run: () => this.openConfirm()
        },
        {
          id: 'confirm-shorthand',
          section: 'Basics',
          label: 'confirm() / alert() shorthand',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur.confirm('Delete item?', 'This cannot be undone.')
  .subscribe((result) => {
    if (result === ModalResult.Yes) { /* ... */ }
  });

this.modalieur.alert('Saved', 'Your changes were saved.').subscribe();`,
          run: () => this.openConfirmShorthand()
        },
        {
          id: 'messagebox',
          section: 'Basics',
          label: 'messageBox()',
          btnClass: 'btn-outline-dark',
          code: `// Emits ModalResult; custom button set.
this.modalieur
  .messageBox({
    title: 'Retry?',
    message: 'Connection failed.',
    buttons: MessageBoxButtons.RetryCancel,
  })
  .subscribe((result) => { /* Retry | Cancel */ });`,
          run: () => this.openMessageBoxShorthand()
        },
        {
          id: 'data',
          section: 'Basics',
          label: 'Returns data',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(NamePromptModalComponent).subscribe((outcome) => {
  if (outcome.result === ModalResult.Data) {
    console.log(outcome.data?.name);
  }
});`,
          run: () => this.openNamePrompt()
        },
        {
          id: 'dismissal',
          section: 'Basics',
          label: 'Dismissal (backdrop / Escape)',
          btnClass: 'btn-outline-primary',
          code: `// Click backdrop or press Escape → ModalResult.Cancel
this.modalieur
  .show(ConfirmModalComponent, { data })
  .subscribe((outcome) => { /* Cancel on dismissal */ });`,
          run: () => this.openDismissal()
        }
      ]
    },
    {
      title: 'Config',
      examples: [
        {
          id: 'large',
          section: 'Config',
          label: 'Large size (overrides app default)',
          btnClass: 'btn-outline-primary',
          code: `// App default is size: 'lg' via provideModalieur.
// Per-call size still overrides when needed.
this.modalieur.show(ConfirmModalComponent, { size: 'sm', data });`,
          run: () => this.openLarge()
        },
        {
          id: 'bootstrap-fullscreen',
          section: 'Config',
          label: 'Bootstrap fullscreen',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, { size: 'fullscreen', data })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openBootstrapFullscreen()
        },
        {
          id: 'custom-fullscreen',
          section: 'Config',
          label: 'Custom full-screen (unstyled)',
          btnClass: 'btn-outline-primary',
          code: `// unstyled: true — no Bootstrap container; component owns layout.
this.modalieur
  .show(FullscreenModalComponent, { unstyled: true, data })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openCustomFullscreen()
        },
        {
          id: 'static',
          section: 'Config',
          label: 'Non-dismissible',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, { dismissible: false, data })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openStatic()
        },
        {
          id: 'scrollable',
          section: 'Config',
          label: 'Scrollable body',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(ConfirmModalComponent, {
  scrollable: true,
  data: { title: '…', message: longText },
});`,
          run: () => this.openScrollable()
        },
        {
          id: 'unstyled',
          section: 'Config',
          label: 'No Bootstrap (unstyled)',
          btnClass: 'btn-outline-secondary',
          code: `this.modalieur
  .show(PlainModalComponent, { unstyled: true })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openUnstyled()
        }
      ]
    },
    {
      title: 'Async',
      examples: [
        {
          id: 'until',
          section: 'Async',
          label: 'Auto-close (showUntil)',
          btnClass: 'btn-outline-primary',
          code: `// Closes with ModalResult.AutoClose on first emission.
this.modalieur
  .showUntil(WaitingModalComponent, timer(4000).pipe(map(() => false)))
  .subscribe((outcome) => {
    // outcome.result === ModalResult.AutoClose
  });`,
          run: () => this.openWaiting()
        },
        {
          id: 'condition',
          section: 'Async',
          label: 'Auto-close on condition (showUntilCondition)',
          btnClass: 'btn-outline-primary',
          code: `const ready$ = concat(
  timer(1000).pipe(map(() => false)),
  timer(1500).pipe(map(() => true)),
);
this.modalieur
  .showUntilCondition(WaitingModalComponent, ready$)
  .subscribe((outcome) => {
    // outcome.result === ModalResult.AutoClose
  });`,
          run: () => this.openConditional()
        },
        {
          id: 'ref',
          section: 'Async',
          label: 'Programmatic control (showAndReturnRef)',
          btnClass: 'btn-outline-primary',
          code: `const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
  dismissible: false,
});
ref.closed$.subscribe((outcome) => { /* ... */ });
save().then((id) => ref.close(ModalResult.Ok, { savedId: id }));`,
          run: () => this.openProgress()
        }
      ]
    },
    {
      title: 'MessageBox',
      examples: [
        {
          id: 'mb-ok',
          section: 'MessageBox',
          label: 'MessageBox: OK',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'OK', message: '…', buttons: MessageBoxButtons.OK },
  })
  .subscribe((o) => { /* o.result === ModalResult.Ok */ });`,
          run: () => this.openMessageBox('mb-ok', MessageBoxButtons.OK, 'OK', 'A single OK button.')
        },
        {
          id: 'mb-okcancel',
          section: 'MessageBox',
          label: 'MessageBox: OK / Cancel',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'Save?', message: '…', buttons: MessageBoxButtons.OKCancel },
  })
  .subscribe((o) => { /* Ok | Cancel */ });`,
          run: () => this.openMessageBox('mb-okcancel', MessageBoxButtons.OKCancel, 'Save changes?', 'Proceed with saving?')
        },
        {
          id: 'mb-yesno',
          section: 'MessageBox',
          label: 'MessageBox: Yes / No',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.YesNo, /* ... */ },
  })
  .subscribe((o) => { /* Yes | No */ });`,
          run: () => this.openMessageBox('mb-yesno', MessageBoxButtons.YesNo, 'Delete item?', 'This cannot be undone.')
        },
        {
          id: 'mb-projection',
          section: 'MessageBox',
          label: 'MessageBox: content projection',
          btnClass: 'btn-outline-dark',
          code: `<mdlr-message-box>
  <div mbHeader>…</div>
  <div mbBody>…</div>
  <div mbFooter>…</div>
</mdlr-message-box>

this.modalieur.show(CustomMessageBoxComponent).subscribe();`,
          run: () => this.openCustomMessageBox()
        }
      ]
    }
  ];

  protected outcomeFor(id: string): string {
    return this.outcomes()[id] ?? '—';
  }

  protected openConfirm(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: { title: 'Confirm', message: 'Do you want to continue?' }
      })
      .subscribe(outcome => this.report('confirm', outcome));
  }

  protected openConfirmShorthand(): void {
    this.modalieur.confirm('Delete item?', 'This cannot be undone.').subscribe(result => {
      this.report('confirm-shorthand', result);
    });
  }

  protected openMessageBoxShorthand(): void {
    this.modalieur
      .messageBox({
        title: 'Retry?',
        message: 'Could not reach the server.',
        buttons: MessageBoxButtons.RetryCancel
      })
      .subscribe(result => this.report('messagebox', result));
  }

  protected openDismissal(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: { title: 'Dismissible', message: 'Click backdrop or press Escape to dismiss → Cancel.' }
      })
      .subscribe(outcome => this.report('dismissal', outcome));
  }

  protected openLarge(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'sm',
        data: { title: 'Small modal', message: 'Per-call size: sm overrides app default lg.' }
      })
      .subscribe(outcome => this.report('large', outcome));
  }

  protected openBootstrapFullscreen(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'fullscreen',
        data: { title: 'Bootstrap fullscreen', message: 'Uses ModalConfig size: fullscreen (.modal-fullscreen).' }
      })
      .subscribe(outcome => this.report('bootstrap-fullscreen', outcome));
  }

  protected openCustomFullscreen(): void {
    this.modalieur
      .show(FullscreenModalComponent, {
        unstyled: true,
        data: { title: 'Custom full-screen', message: 'Unstyled — component owns the layout.' }
      })
      .subscribe(outcome => this.report('custom-fullscreen', outcome));
  }

  protected openStatic(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        dismissible: false,
        data: { title: 'Non-dismissible', message: 'Backdrop and Escape will not close this.' }
      })
      .subscribe(outcome => this.report('static', outcome));
  }

  protected openScrollable(): void {
    const message = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet.`).join('\n\n');
    this.modalieur
      .show(ConfirmModalComponent, {
        scrollable: true,
        data: { title: 'Scrollable', message }
      })
      .subscribe(outcome => this.report('scrollable', outcome));
  }

  protected openWaiting(): void {
    this.modalieur
      .showUntil(WaitingModalComponent, timer(4000).pipe(map(() => false)), {
        data: {
          title: 'Auto-close (showUntil)',
          message: 'Closes in 4 seconds with ModalResult.AutoClose.'
        }
      })
      .subscribe(outcome => this.report('until', outcome));
  }

  protected openConditional(): void {
    const condition$ = concat(timer(1000).pipe(map(() => false)), timer(1500).pipe(map(() => true)));
    this.modalieur
      .showUntilCondition(WaitingModalComponent, condition$, {
        data: {
          title: 'Auto-close (showUntilCondition)',
          message: 'Ignores false; closes with AutoClose when condition$ emits true.'
        }
      })
      .subscribe(outcome => this.report('condition', outcome));
  }

  protected openNamePrompt(): void {
    this.modalieur.show(NamePromptModalComponent).subscribe(outcome => this.report('data', outcome));
  }

  protected openProgress(): void {
    const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
      dismissible: false,
      data: { title: 'Saving…', message: 'Closes programmatically after 2 seconds.' }
    });
    ref.closed$.subscribe(outcome => this.report('ref', outcome));
    setTimeout(() => ref.close(ModalResult.Ok, { savedId: 42 }), 2000);
  }

  protected openUnstyled(): void {
    this.modalieur.show(PlainModalComponent, { unstyled: true }).subscribe(outcome => this.report('unstyled', outcome));
  }

  protected openMessageBox(id: string, buttons: MessageBoxButtons, title: string, message: string): void {
    this.modalieur.show(MessageBoxDialog, { data: { title, message, buttons } }).subscribe(outcome => this.report(id, outcome));
  }

  protected openCustomMessageBox(): void {
    this.modalieur.show(CustomMessageBoxComponent).subscribe(outcome => this.report('mb-projection', outcome));
  }

  private report(id: string, outcome: ModalOutcome | ModalResult): void {
    const result = typeof outcome === 'number' ? outcome : outcome.result;
    const data = typeof outcome === 'number' ? undefined : outcome.data;
    const label = ModalResult[result];
    const text = data ? `${label} — data: ${JSON.stringify(data)}` : label;
    this.outcomes.update(current => ({ ...current, [id]: text }));
  }
}
