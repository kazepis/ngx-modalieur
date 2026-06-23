import { Component, inject, signal } from '@angular/core';
import { MessageBoxButtons, MessageBoxDialog, ModalieurService, ModalOutcome, ModalResult } from '@kazepis/ngx-modalieur';
import { HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { concat, map, timer } from 'rxjs';

import { ExampleId } from './examples';
import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { CustomMessageBoxComponent } from './modals/custom-message-box.component';
import { FullscreenModalComponent } from './modals/fullscreen-modal.component';
import { NamePromptModalComponent } from './modals/name-prompt-modal.component';
import { PlainModalComponent } from './modals/plain-modal.component';
import { WaitingModalComponent } from './modals/waiting-modal.component';

interface DemoExample {
  id: ExampleId;
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
  imports: [HighlightAuto, HighlightLineNumbers],
  templateUrl: './app.html'
})
export class App {
  private readonly modalieur = inject(ModalieurService);

  protected readonly ExampleId = ExampleId;
  protected readonly outcomes = signal<Partial<Record<ExampleId, string>>>({});

  protected readonly sections: DemoSection[] = [
    {
      title: 'Setup',
      examples: [
        {
          id: ExampleId.Setup,
          section: 'Setup',
          label: 'Import styles and provide modalieur',
          btnClass: 'btn-secondary',
          code: `// import these styles to your angular.json:
"node_modules/bootstrap/dist/css/bootstrap.min.css",
"node_modules/@angular/cdk/overlay-prebuilt.css",
"node_modules/@kazepis/ngx-modalieur/styles/ngx-modalieur.css"

// provide modalieur with the desired config in app.config.ts
// e.g. we want all modals to be large by default
providers: [provideModalieur({ size: 'lg' })] `,
          run: () => {}
        }
      ]
    },
    {
      title: 'Reactive handling',
      examples: [
        {
          id: ExampleId.Reactive,
          section: 'Reactive handling',
          label: 'Why reactive? — subscribe once, act on the outcome',
          btnClass: 'btn-secondary',
          code: `// The core idea: open → subscribe → react. One emission when the modal closes.
this.modalieur
  .show(ConfirmModalComponent, { data: { title: 'Delete?', message: 'Sure?' } })
  .subscribe((outcome) => {
    if (outcome.result === ModalResult.Yes) {
      this.deleteItem();
    }
  });

// Chain with RxJS — no callback pyramid
this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .pipe(
    filter((result) => result === ModalResult.Yes),
    switchMap(() => this.api.delete(id)),
  )
  .subscribe();

// Auto-close when an external observable emits (hub event, timer, etc.)
this.modalieur
  .showUntil(WaitingModalComponent, sessionEnded$)
  .subscribe((outcome) => {
    // outcome.result === ModalResult.AutoClose when sessionEnded$ fired
  });

// vs. imperative style: showAndReturnRef → hide() → setResult(id, type) on a global bus`,
          run: () => {}
        }
      ]
    },
    {
      title: 'Basics',
      examples: [
        {
          id: ExampleId.Confirm,
          section: 'Basics',
          label: 'Confirm using consumer component (ConfirmModalComponent)',
          btnClass: 'btn-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, {
    data: {
      title: 'Confirm',
      message: 'Do you want to continue?'
    },
  })
  .subscribe((outcome) => {
    if (outcome.result === ModalResult.Yes) {
      console.log('User clicked Yes');
    }
  });`,
          run: () => this.openConfirm()
        },
        {
          id: ExampleId.ConfirmShorthand,
          section: 'Basics',
          label: 'confirm() / alert() shorthand',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .subscribe((result) => {
    if (result === ModalResult.Yes) {
      this.modalieur
        .alert('Saved', 'Your changes were saved.', { size: 'sm' })
        .subscribe();
    }
  });
`,
          run: () => this.openConfirmShorthand()
        },
        {
          id: ExampleId.MessageBoxShorthand,
          section: 'Basics',
          label: 'messageBox()',
          btnClass: 'btn-outline-dark',
          code: `// Emits ModalResult; custom button set.
this.modalieur
  .messageBox({
    title: 'Retry?',
    message: 'Could not reach the server.',
    buttons: MessageBoxButtons.RetryCancel,
  })
  .subscribe((result) => { /* Retry | Cancel */ });`,
          run: () => this.openMessageBoxShorthand()
        },
        {
          id: ExampleId.NamePrompt,
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
          id: ExampleId.Dismissal,
          section: 'Basics',
          label: 'Dismissal (backdrop / Escape)',
          btnClass: 'btn-outline-primary',
          code: `// Click backdrop or press Escape → ModalResult.Cancel
this.modalieur
  .show(ConfirmModalComponent, {
    data: {
      title: 'Dismissible',
      message: 'Click backdrop or press Escape to dismiss → Cancel.'
    }
  )
  .subscribe((outcome) => { /* Cancel on dismissal */ });`,
          run: () => this.openDismissal()
        }
      ]
    },
    {
      title: 'Config',
      examples: [
        {
          id: ExampleId.SizeOverride,
          section: 'Config',
          label: 'Small size (overrides app default)',
          btnClass: 'btn-outline-primary',
          code: `// App default is size: 'lg' via provideModalieur.
// Per-call size still overrides when needed.
this.modalieur.show(ConfirmModalComponent, { size: 'sm', data });`,
          run: () => this.openSmall()
        },
        {
          id: ExampleId.BootstrapFullscreen,
          section: 'Config',
          label: 'Bootstrap fullscreen',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, { size: 'fullscreen', data })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openBootstrapFullscreen()
        },
        {
          id: ExampleId.CustomFullscreen,
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
          id: ExampleId.NonDismissible,
          section: 'Config',
          label: 'Non-dismissible',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, { dismissible: false, data })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openStatic()
        },
        {
          id: ExampleId.ScrollableBody,
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
          id: ExampleId.Unstyled,
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
          id: ExampleId.ShowUntil,
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
          id: ExampleId.ShowUntilCondition,
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
          id: ExampleId.ProgrammaticRef,
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
          id: ExampleId.MessageBoxOk,
          section: 'MessageBox',
          label: 'MessageBox: OK',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'OK', message: '…', buttons: MessageBoxButtons.OK },
  })
  .subscribe((o) => { /* o.result === ModalResult.Ok */ });`,
          run: () => this.openMessageBox(ExampleId.MessageBoxOk, MessageBoxButtons.OK, 'OK', 'A single OK button.')
        },
        {
          id: ExampleId.MessageBoxOkCancel,
          section: 'MessageBox',
          label: 'MessageBox: OK / Cancel',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { title: 'Save?', message: '…', buttons: MessageBoxButtons.OKCancel },
  })
  .subscribe((o) => { /* Ok | Cancel */ });`,
          run: () =>
            this.openMessageBox(
              ExampleId.MessageBoxOkCancel,
              MessageBoxButtons.OKCancel,
              'Save changes?',
              'Proceed with saving?'
            )
        },
        {
          id: ExampleId.MessageBoxYesNo,
          section: 'MessageBox',
          label: 'MessageBox: Yes / No',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .show(MessageBoxDialog, {
    data: { buttons: MessageBoxButtons.YesNo, /* ... */ },
  })
  .subscribe((o) => { /* Yes | No */ });`,
          run: () =>
            this.openMessageBox(ExampleId.MessageBoxYesNo, MessageBoxButtons.YesNo, 'Delete item?', 'This cannot be undone.')
        },
        {
          id: ExampleId.MessageBoxProjection,
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

  protected outcomeFor(id: ExampleId): string {
    return this.outcomes()[id] ?? '—';
  }

  protected openConfirm(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: { title: 'Confirm', message: 'Do you want to continue?' }
      })
      .subscribe(outcome => {
        if (outcome.result === ModalResult.Yes) {
          console.log('User clicked Yes');
        }

        this.report(ExampleId.Confirm, outcome);
      });
  }

  protected openConfirmShorthand(): void {
    this.modalieur.confirm('Delete item?', 'This cannot be undone.').subscribe(result => {
      this.report(ExampleId.ConfirmShorthand, result);
      if (result === ModalResult.Yes) {
        this.modalieur.alert('Saved', 'Your changes were saved.', { size: 'sm' }).subscribe();
      }
    });
  }

  protected openMessageBoxShorthand(): void {
    this.modalieur
      .messageBox({
        title: 'Retry?',
        message: 'Could not reach the server.',
        buttons: MessageBoxButtons.RetryCancel
      })
      .subscribe(result => this.report(ExampleId.MessageBoxShorthand, result));
  }

  protected openDismissal(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        data: {
          title: 'Dismissible',
          message: 'Click backdrop or press Escape to dismiss → Cancel.'
        }
      })
      .subscribe(outcome => this.report(ExampleId.Dismissal, outcome));
  }

  protected openSmall(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'sm',
        data: { title: 'Small modal', message: 'Per-call size: sm overrides app default lg.' }
      })
      .subscribe(outcome => this.report(ExampleId.SizeOverride, outcome));
  }

  protected openBootstrapFullscreen(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        size: 'fullscreen',
        data: { title: 'Bootstrap fullscreen', message: 'Uses ModalConfig size: fullscreen (.modal-fullscreen).' }
      })
      .subscribe(outcome => this.report(ExampleId.BootstrapFullscreen, outcome));
  }

  protected openCustomFullscreen(): void {
    this.modalieur
      .show(FullscreenModalComponent, {
        unstyled: true,
        data: { title: 'Custom full-screen', message: 'Unstyled — component owns the layout.' }
      })
      .subscribe(outcome => this.report(ExampleId.CustomFullscreen, outcome));
  }

  protected openStatic(): void {
    this.modalieur
      .show(ConfirmModalComponent, {
        dismissible: false,
        data: { title: 'Non-dismissible', message: 'Backdrop and Escape will not close this.' }
      })
      .subscribe(outcome => this.report(ExampleId.NonDismissible, outcome));
  }

  protected openScrollable(): void {
    const message = Array.from({ length: 120 }, (_, i) => `Paragraph ${i + 1}: Lorem ipsum dolor sit amet.`).join('\n\n');
    this.modalieur
      .show(ConfirmModalComponent, {
        scrollable: true,
        data: { title: 'Scrollable', message }
      })
      .subscribe(outcome => this.report(ExampleId.ScrollableBody, outcome));
  }

  protected openWaiting(): void {
    this.modalieur
      .showUntil(WaitingModalComponent, timer(4000).pipe(map(() => false)), {
        data: {
          title: 'Auto-close (showUntil)',
          message: 'Closes in 4 seconds with ModalResult.AutoClose.'
        }
      })
      .subscribe(outcome => this.report(ExampleId.ShowUntil, outcome));
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
      .subscribe(outcome => this.report(ExampleId.ShowUntilCondition, outcome));
  }

  protected openNamePrompt(): void {
    this.modalieur.show(NamePromptModalComponent).subscribe(outcome => this.report(ExampleId.NamePrompt, outcome));
  }

  protected openProgress(): void {
    const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
      dismissible: false,
      data: { title: 'Saving…', message: 'Closes programmatically after 2 seconds.' }
    });
    ref.closed$.subscribe(outcome => this.report(ExampleId.ProgrammaticRef, outcome));
    setTimeout(() => ref.close(ModalResult.Ok, { savedId: 42 }), 2000);
  }

  protected openUnstyled(): void {
    this.modalieur
      .show(PlainModalComponent, { unstyled: true })
      .subscribe(outcome => this.report(ExampleId.Unstyled, outcome));
  }

  protected openMessageBox(id: ExampleId, buttons: MessageBoxButtons, title: string, message: string): void {
    this.modalieur
      .show(MessageBoxDialog, { data: { title, message, buttons } })
      .subscribe(outcome => this.report(id, outcome));
  }

  protected openCustomMessageBox(): void {
    this.modalieur
      .show(CustomMessageBoxComponent)
      .subscribe(outcome => this.report(ExampleId.MessageBoxProjection, outcome));
  }

  private report(id: ExampleId, outcome: ModalOutcome | ModalResult): void {
    const result = typeof outcome === 'number' ? outcome : outcome.result;
    const data = typeof outcome === 'number' ? undefined : outcome.data;
    const label = ModalResult[result];
    const text = data ? `${label} — data: ${JSON.stringify(data)}` : label;
    this.outcomes.update(current => ({ ...current, [id]: text }));
  }
}
