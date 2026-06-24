import { Component, inject, signal } from '@angular/core';
import {
  MESSAGE_BOX_BODY_ID,
  MESSAGE_BOX_TITLE_ID,
  MessageBoxButtons,
  MessageBoxDialog,
  ModalieurService,
  ModalOutcome,
  ModalResult
} from '@kazepis/ngx-modalieur';
import { HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
import { concat, filter, map, timer } from 'rxjs';

import { ExampleId } from './examples';
import { ConfirmModalComponent } from './modals/confirm-modal.component';
import { CustomMessageBoxComponent } from './modals/custom-message-box.component';
import { FullscreenModalComponent } from './modals/fullscreen-modal.component';
import { NamePromptModalComponent } from './modals/name-prompt-modal.component';
import { PlainModalComponent } from './modals/plain-modal.component';
import { WaitingModalComponent } from './modals/waiting-modal.component';

interface DemoExample {
  id: ExampleId;
  kind: 'docs' | 'try';
  label: string;
  description?: string;
  btnClass: string;
  code: string;
  run: () => void;
}

interface DemoSection {
  id: string;
  title: string;
  description: string;
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

  protected readonly outcomes = signal<Partial<Record<ExampleId, string>>>({});

  protected readonly sections: DemoSection[] = [
    {
      id: 'getting-started',
      title: 'Getting started',
      description: 'Install styles, register app-wide defaults, then open your first modal.',
      examples: [
        {
          id: ExampleId.Setup,
          kind: 'docs',
          label: 'Setup',
          description: 'Global styles and provideModalieur() in app.config.ts.',
          btnClass: 'btn-secondary',
          code: `// angular.json → styles
"node_modules/bootstrap/dist/css/bootstrap.min.css",
"node_modules/@angular/cdk/overlay-prebuilt.css",
"node_modules/@kazepis/ngx-modalieur/styles/ngx-modalieur.css"

// app.config.ts
providers: [provideModalieur({ size: 'lg' })]`,
          run: () => {}
        },
        {
          id: ExampleId.QuickStart,
          kind: 'try',
          label: 'Quick start — confirm()',
          description: 'One-liner confirm; subscribe to ModalResult.',
          btnClass: 'btn-primary',
          code: `this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .subscribe((result) => {
    if (result === ModalResult.Yes) {
      // act on Yes
    }
  });`,
          run: () => this.openQuickStart()
        }
      ]
    },
    {
      id: 'why-reactive',
      title: 'Why reactive',
      description: 'Open → subscribe → react. One emission when the modal closes — no modal IDs or result buses.',
      examples: [
        {
          id: ExampleId.Reactive,
          kind: 'docs',
          label: 'Reactive modal handling',
          description: 'Compare with imperative setResult(id, type) patterns.',
          btnClass: 'btn-secondary',
          code: `// Open → subscribe → react
this.modalieur.show(MyModal, { data }).subscribe((outcome) => {
  if (outcome.result === ModalResult.Yes) this.save();
});

// Chain with RxJS
this.modalieur.confirm('Delete?', 'Sure?').pipe(
  filter((r) => r === ModalResult.Yes),
  switchMap(() => this.api.delete(id)),
).subscribe();

// Auto-close when an external observable emits
this.modalieur.showUntil(SpinnerModal, sessionEnded$).subscribe();`,
          run: () => {}
        }
      ]
    },
    {
      id: 'message-boxes',
      title: 'Message boxes',
      description: 'Shorthand APIs for confirm, alert, and custom button sets — or show(MessageBoxDialog) for full control.',
      examples: [
        {
          id: ExampleId.ConfirmShorthand,
          kind: 'try',
          label: 'confirm() then alert()',
          description: 'Shorthand wrappers; aria wired automatically.',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .subscribe((result) => {
    if (result === ModalResult.Yes) {
      this.modalieur
        .alert('Saved', 'Your changes were saved.', { size: 'sm' })
        .subscribe();
    }
  });`,
          run: () => this.openConfirmShorthand()
        },
        {
          id: ExampleId.MessageBoxShorthand,
          kind: 'try',
          label: 'messageBox() — Retry / Cancel',
          description: 'Custom button set; emits ModalResult.',
          btnClass: 'btn-outline-dark',
          code: `this.modalieur
  .messageBox({
    title: 'Retry?',
    message: 'Could not reach the server.',
    buttons: MessageBoxButtons.RetryCancel,
  })
  .subscribe((result) => {
    // ModalResult.Retry | ModalResult.Cancel
  });`,
          run: () => this.openMessageBoxShorthand()
        },
        {
          id: ExampleId.MessageBoxLowLevel,
          kind: 'try',
          label: 'show(MessageBoxDialog) + aria ids',
          description: 'Full ModalOutcome; pass MESSAGE_BOX_*_ID for accessibility.',
          btnClass: 'btn-outline-dark',
          code: `import {
  MESSAGE_BOX_BODY_ID,
  MESSAGE_BOX_TITLE_ID,
  MessageBoxDialog,
  MessageBoxButtons,
} from '@kazepis/ngx-modalieur';

this.modalieur
  .show(MessageBoxDialog, {
    ariaLabelledBy: MESSAGE_BOX_TITLE_ID,
    ariaDescribedBy: MESSAGE_BOX_BODY_ID,
    data: {
      title: 'Delete?',
      message: 'Cannot be undone.',
      buttons: MessageBoxButtons.YesNo,
    },
  })
  .subscribe((outcome) => {
    // outcome.result
  });`,
          run: () => this.openMessageBoxLowLevel()
        },
        {
          id: ExampleId.MessageBoxProjection,
          kind: 'try',
          label: 'Content projection',
          description: 'Custom markup via mdlr-message-box slots.',
          btnClass: 'btn-outline-dark',
          code: `// CustomMessageBoxComponent wraps <mdlr-message-box>
this.modalieur
  .show(CustomMessageBoxComponent)
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openCustomMessageBox()
        }
      ]
    },
    {
      id: 'custom-modals',
      title: 'Custom modals',
      description: 'Extend ModalContent; render Bootstrap header, body, and footer.',
      examples: [
        {
          id: ExampleId.Confirm,
          kind: 'try',
          label: 'show(ConfirmModalComponent)',
          description: 'Consumer component with yes() / no() helpers.',
          btnClass: 'btn-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, {
    data: { title: 'Confirm', message: 'Do you want to continue?' },
  })
  .subscribe((outcome) => {
    if (outcome.result === ModalResult.Yes) {
      console.log('User clicked Yes');
    }
  });`,
          run: () => this.openConfirm()
        },
        {
          id: ExampleId.Dismissal,
          kind: 'try',
          label: 'Dismissal — backdrop / Escape',
          description: 'Dismissible modals close with ModalResult.Cancel.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .show(ConfirmModalComponent, {
    data: {
      title: 'Dismissible',
      message: 'Click backdrop or press Escape → Cancel.',
    },
  })
  .subscribe((outcome) => {
    // outcome.result === ModalResult.Cancel on dismissal
  });`,
          run: () => this.openDismissal()
        }
      ]
    },
    {
      id: 'data-in-out',
      title: 'Data in and out',
      description: 'Pass input via config.data; return payload with respondWithData().',
      examples: [
        {
          id: ExampleId.NamePrompt,
          kind: 'try',
          label: 'Name prompt — returns data',
          description: 'ModalResult.Data with outcome.data.name.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(NamePromptModalComponent).subscribe((outcome) => {
  if (outcome.result === ModalResult.Data) {
    console.log(outcome.data?.name);
  }
});`,
          run: () => this.openNamePrompt()
        }
      ]
    },
    {
      id: 'configuration',
      title: 'Configuration',
      description: 'Per-call ModalConfig merged over app defaults from provideModalieur().',
      examples: [
        {
          id: ExampleId.SizeOverride,
          kind: 'try',
          label: 'size: sm',
          description: 'Overrides app default lg from provideModalieur().',
          btnClass: 'btn-outline-primary',
          code: `// App default is size: 'lg' via provideModalieur.
this.modalieur.show(ConfirmModalComponent, {
  size: 'sm',
  data: { title: 'Small', message: 'Per-call size overrides app default.' },
});`,
          run: () => this.openSmall()
        },
        {
          id: ExampleId.ScrollableBody,
          kind: 'try',
          label: 'scrollable: true',
          description: 'Long body scrolls inside the dialog.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(ConfirmModalComponent, {
  scrollable: true,
  data: { title: 'Terms', message: longText },
});`,
          run: () => this.openScrollable()
        },
        {
          id: ExampleId.NonDismissible,
          kind: 'try',
          label: 'dismissible: false',
          description: 'Backdrop and Escape do not close the modal.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(ConfirmModalComponent, {
  dismissible: false,
  data: { title: 'Non-dismissible', message: 'Use a button to close.' },
});`,
          run: () => this.openStatic()
        },
        {
          id: ExampleId.BootstrapFullscreen,
          kind: 'try',
          label: 'size: fullscreen',
          description: 'Bootstrap .modal-fullscreen via the built-in shell.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(ConfirmModalComponent, {
  size: 'fullscreen',
  data: { title: 'Fullscreen', message: 'Bootstrap fullscreen size.' },
});`,
          run: () => this.openBootstrapFullscreen()
        },
        {
          id: ExampleId.CustomFullscreen,
          kind: 'try',
          label: 'unstyled — custom full-screen',
          description: 'No Bootstrap shell; component owns layout.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur.show(FullscreenModalComponent, {
  unstyled: true,
  data: { title: 'Custom overlay', message: 'Component owns the layout.' },
});`,
          run: () => this.openCustomFullscreen()
        },
        {
          id: ExampleId.Unstyled,
          kind: 'try',
          label: 'unstyled — plain panel',
          description: 'Minimal overlay without Bootstrap modal markup.',
          btnClass: 'btn-outline-secondary',
          code: `this.modalieur
  .show(PlainModalComponent, { unstyled: true })
  .subscribe((outcome) => { /* ... */ });`,
          run: () => this.openUnstyled()
        }
      ]
    },
    {
      id: 'reactive-workflows',
      title: 'Reactive workflows',
      description: 'Compose modals with RxJS operators in a single pipeline.',
      examples: [
        {
          id: ExampleId.ReactiveChain,
          kind: 'try',
          label: 'confirm().pipe(filter, …)',
          description: 'Only proceed when the user clicks Yes.',
          btnClass: 'btn-outline-primary',
          code: `import { filter } from 'rxjs/operators';

this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .pipe(filter((result) => result === ModalResult.Yes))
  .subscribe(() => {
    // user confirmed — run side effect
  });`,
          run: () => this.openReactiveChain()
        }
      ]
    },
    {
      id: 'auto-close',
      title: 'Auto-close',
      description: 'Close when an observable emits — result is ModalResult.AutoClose.',
      examples: [
        {
          id: ExampleId.ShowUntil,
          kind: 'try',
          label: 'showUntil — first emission',
          description: 'Closes on any value, including false.',
          btnClass: 'btn-outline-primary',
          code: `this.modalieur
  .showUntil(WaitingModalComponent, timer(4000).pipe(map(() => false)))
  .subscribe((outcome) => {
    // outcome.result === ModalResult.AutoClose
  });`,
          run: () => this.openWaiting()
        },
        {
          id: ExampleId.ShowUntilCondition,
          kind: 'try',
          label: 'showUntilCondition — first truthy',
          description: 'Ignores falsy emissions until ready.',
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
        }
      ]
    },
    {
      id: 'programmatic-control',
      title: 'Programmatic control',
      description: 'Hold a ModalRef and close from outside the component.',
      examples: [
        {
          id: ExampleId.ProgrammaticRef,
          kind: 'try',
          label: 'showAndReturnRef',
          description: 'closed$ + ref.close() after async work.',
          btnClass: 'btn-outline-primary',
          code: `const ref = this.modalieur.showAndReturnRef(WaitingModalComponent, {
  dismissible: false,
  data: { title: 'Saving…', message: 'Closes programmatically.' },
});

ref.closed$.subscribe((outcome) => { /* ... */ });

await save();
ref.close(ModalResult.Ok, { savedId: 42 });`,
          run: () => this.openProgress()
        }
      ]
    }
  ];

  protected outcomeFor(id: ExampleId): string {
    return this.outcomes()[id] ?? '—';
  }

  protected openQuickStart(): void {
    this.modalieur.confirm('Delete item?', 'This cannot be undone.').subscribe(result => {
      this.report(ExampleId.QuickStart, result);
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

  protected openMessageBoxLowLevel(): void {
    this.modalieur
      .show(MessageBoxDialog, {
        ariaLabelledBy: MESSAGE_BOX_TITLE_ID,
        ariaDescribedBy: MESSAGE_BOX_BODY_ID,
        data: {
          title: 'Delete?',
          message: 'Cannot be undone.',
          buttons: MessageBoxButtons.YesNo
        }
      })
      .subscribe(outcome => this.report(ExampleId.MessageBoxLowLevel, outcome));
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

  protected openReactiveChain(): void {
    this.modalieur
      .confirm('Delete item?', 'This cannot be undone.')
      .pipe(filter(result => result === ModalResult.Yes))
      .subscribe(() => this.report(ExampleId.ReactiveChain, ModalResult.Yes));
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
