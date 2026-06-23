# @kazepis/ngx-modalieur

Reactive, Bootstrap 5.3-styled modals for Angular, built on top of Angular CDK `Dialog`.

- Open a modal and `subscribe` to its result, Windows-Forms-`MessageBox` style.
- Every modal is wrapped in a Bootstrap `.modal-dialog > .modal-content` container automatically.
- CDK powers focus trapping, Escape/backdrop handling, and accessibility under the hood, but never leaks into your code.

## Installation

```bash
npm install @kazepis/ngx-modalieur @angular/cdk bootstrap
```

`@angular/cdk` is a required peer dependency. `bootstrap` is an optional peer dependency (needed for the default Bootstrap look).

## Styles

Add the following global stylesheets (e.g. in `angular.json` `styles`):

```json
"node_modules/bootstrap/dist/css/bootstrap.min.css",
"node_modules/@angular/cdk/overlay-prebuilt.css",
"node_modules/@kazepis/ngx-modalieur/styles/ngx-modalieur.css"
```

## Quick start

```ts
// app.config.ts — optional app-wide defaults
import { provideModalieur } from '@kazepis/ngx-modalieur';

export const appConfig = {
  providers: [provideModalieur({ dismissible: false, size: 'lg' })]
};
```

A modal is just a component that renders the Bootstrap inner sections and closes itself
via the `ModalContent` helpers:

```ts
import { Component, inject } from '@angular/core';
import { MODAL_DATA, ModalContent } from '@kazepis/ngx-modalieur';

@Component({
  standalone: true,
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ data.title }}</h5>
      <button class="btn-close" (click)="cancel()"></button>
    </div>
    <div class="modal-body">{{ data.message }}</div>
    <div class="modal-footer">
      <button class="btn btn-secondary" (click)="no()">No</button>
      <button class="btn btn-primary" (click)="yes()">Yes</button>
    </div>
  `
})
export class ConfirmModalComponent extends ModalContent {
  protected readonly data = inject<{ title: string; message: string }>(MODAL_DATA);
}
```

Open it and react to the outcome:

```ts
import { inject } from '@angular/core';
import { ModalieurService, ModalResult } from '@kazepis/ngx-modalieur';

const modal = inject(ModalieurService);

modal.show(ConfirmModalComponent, { data: { title: 'Confirm', message: 'Are you sure?' } }).subscribe(outcome => {
  if (outcome.result === ModalResult.Yes) {
    // ...
  }
});
```

## API

### `ModalieurService`

| Method                                               | Description                                             |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `show(component, config?)`                           | Opens a modal; emits the `ModalOutcome` when it closes. |
| `showUntil(component, until$, config?)`              | Auto-closes on the **first emission** from `until$` (any value). |
| `showUntilCondition(component, condition$, config?)` | Auto-closes on the **first truthy** emission from `condition$`. |
| `showAndReturnRef(component, config?)`               | Returns a `ModalRef` for programmatic control.          |
| `messageBox(options, config?)`                       | Opens `MessageBoxDialog`; emits `ModalResult` only.     |
| `confirm(title, message?, config?)`                  | Yes / No message box; emits `ModalResult`.              |
| `alert(title, message?, config?)`                    | Single OK message box; emits `ModalResult`.             |

#### `showUntil` vs `showUntilCondition`

These look similar but behave differently:

| | `showUntil` | `showUntilCondition` |
| --- | --- | --- |
| Closes when | First emission (any value) | First **truthy** emission |
| `false`, `0`, `''` | **Closes** | Ignored — modal stays open |
| Typical use | Timers, one-shot events | Readiness signals (`loaded$`, `saveComplete$`) |

```ts
import { concat, timer } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

// Closes after 4s — even though the emitted value is false.
modalieur.showUntil(SpinnerModal, timer(4000).pipe(map(() => false))).subscribe(/* closed */);

// Stays open until a truthy value arrives.
const ready$ = pollStatus().pipe(map(s => s === 'done'), filter(Boolean), take(1));
modalieur.showUntilCondition(SpinnerModal, ready$).subscribe(/* closed */);
```

### `ModalConfig`

`data`, `size` (`ModalSize`: `'sm' | 'lg' | 'xl' | 'fullscreen'`), `centered` (default `true`), `scrollable`,
`dismissible` (default `true`), `backdrop` (default `true`), `unstyled`,
`ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`.

App-wide defaults are registered via `provideModalieur(...)` and stored in the `MODALIEUR_CONFIG` token.

### `ModalResult`

`Undefined` (0, the uninitialized-variable safeguard), `Data`, `Yes`, `No`, `Ok`, `Cancel`,
`Abort`, `Retry`, `Ignore`.

A user dismissal (backdrop click or Escape) resolves to `Cancel`. `Undefined` is only the
zero-default and the result of a programmatic `close()` without an explicit result.

### `MessageBoxDialog`

A built-in Bootstrap message box. Use it config-driven, with Windows-Forms-style button sets
(`MessageBoxButtons`: `OK`, `OKCancel`, `AbortRetryIgnore`, `YesNoCancel`, `YesNo`, `RetryCancel`):

```ts
// Convenience helpers — emit ModalResult directly:
modalieur.confirm('Delete item?', 'This cannot be undone.').subscribe(result => {
  if (result === ModalResult.Yes) { /* ... */ }
});

modalieur.alert('Saved', 'Your changes were saved.').subscribe();

// Full control via messageBox:
modalieur
  .messageBox({ title: 'Retry?', message: 'Connection failed.', buttons: MessageBoxButtons.RetryCancel })
  .subscribe(result => { /* Retry | Cancel */ });

// Or open MessageBoxDialog directly for the full ModalOutcome:
modal
  .show(MessageBoxDialog, {
    data: { title: 'Delete item?', message: 'This cannot be undone.', buttons: MessageBoxButtons.YesNo }
  })
  .subscribe(o => {
    if (o.result === ModalResult.Yes) {
      // ...
    }
  });
```

Or with content projection — wrap `<mdlr-message-box>` in your own component and project the parts:

```ts
@Component({
  imports: [MessageBoxDialog],
  template: `
    <mdlr-message-box>
      <div mbHeader>Custom header</div>
      <div mbBody>Custom body</div>
      <div mbFooter class="d-flex gap-2">
        <button class="btn btn-secondary" (click)="cancel()">Dismiss</button>
        <button class="btn btn-primary" (click)="ok()">Got it</button>
      </div>
    </mdlr-message-box>
  `
})
export class MyMessageBox extends ModalContent {}
```

### Input data vs. result data

These are two independent types:

- **Input** — `config.data`, injected into the modal via `MODAL_DATA`.
- **Result** — what the modal returns; declared by extending `ModalContent<TResult>` and read from `outcome.data`. It is inferred for you on `show(...)`.

```ts
// Modal declares its RESULT type via ModalContent<T>; reads INPUT via MODAL_DATA.
class EditModal extends ModalContent<{ saved: boolean }> {
  data = inject<{ id: number }>(MODAL_DATA); // input
  protected save = () => this.respondWithData({ saved: true }); // result
}

// Input is { id }, result is { saved } — no conflict.
modal.show(EditModal, { data: { id: 7 } }).subscribe(o => console.log(o.data?.saved));
```

### `MODAL_DATA`

Inject the `data` passed via `ModalConfig.data`:

```ts
private readonly data = inject<MyData>(MODAL_DATA);
```

## License

MIT
