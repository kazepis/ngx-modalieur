# @kazepis/ngx-modalieur

Reactive, Bootstrap 5.3-styled modals for Angular, built on top of Angular CDK `Dialog`.

- Open a modal and `subscribe` to its result, Windows-Forms-`MessageBox` style.
- **Reactive first** — every open method returns an `Observable`; compose with RxJS, no modal IDs or callback buses.
- Every modal is wrapped in a Bootstrap `.modal-dialog > .modal-content` container automatically.
- CDK is not required in your modal components; the service handles focus trapping, backdrop, and Escape. Advanced container customization is optional and CDK-coupled.

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

## How it works

A modal has two layers:

1. **Your component** (`extends ModalContent`) — renders `.modal-header`, `.modal-body`, `.modal-footer` and closes via helpers like `yes()` / `cancel()`.
2. **Dialog shell** (`BootstrapDialogContainer`) — applied automatically by `ModalieurService` unless `unstyled: true`. Wraps your component in `.modal > .modal-dialog > .modal-content`.

You do **not** extend `BootstrapDialogContainer` to build normal modals. Use `ModalContent` for content; the service wires the Bootstrap shell.

`BootstrapDialogContainer` is exported for **advanced** cases where you need to customize the outer CDK dialog shell. It extends `CdkDialogContainer`.

For fully custom layouts (e.g. a viewport-filling overlay with your own CSS), pass `unstyled: true` and style the component yourself.

## Quick start

```ts
// app.config.ts — optional app-wide defaults
import { provideModalieur } from '@kazepis/ngx-modalieur';

export const appConfig = {
  providers: [provideModalieur({ dismissible: false, size: 'lg' })]
};
```

`provideModalieur()` without arguments registers `MODALIEUR_DEFAULTS` (backdrop, centered, dismissible, etc.). If you omit `provideModalieur()` entirely, the service uses the same defaults via `MODALIEUR_DEFAULTS`.

A modal is just a component that renders the Bootstrap inner sections and closes itself via `ModalContent` helpers:

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

## Reactive modal handling

The main reason to use ngx-modalieur is **reactive modal handling**: opening a modal returns an `Observable` that emits once when the dialog closes. Your business logic stays in one linear `subscribe` (or `pipe`) — no shared result bus, no modal IDs, no `setResult(id, …)` wiring.

### Compared to imperative / callback-style modals

Many Angular modal stacks look like this:

```ts
// Open → get a ref → listen on a global Subject filtered by ref.id → setResult in the component
const ref = modalService.showAndReturnRef(MyModal);
modalService.getModalResult(ref).subscribe(result => { /* ... */ });

// Inside the modal component:
this.modalRef.hide();
this.modalService.setResult(this.modalRef.id, ResultType.Yes);
```

ngx-modalieur collapses that into:

```ts
modalieur.show(MyModal, { data }).subscribe(outcome => {
  if (outcome.result === ModalResult.Yes) {
    this.save();
  }
});

// Inside the modal component (extends ModalContent):
protected confirm = () => this.yes(); // closes and emits — no service injection
```

The modal component does not know about a global service. Closing the dialog **is** emitting the result.

### Compose with the rest of your app

Because the API is Observable-based, modals fit naturally into RxJS pipelines:

```ts
// Chain a confirm before a destructive action
this.modalieur
  .confirm('Delete item?', 'This cannot be undone.')
  .pipe(
    filter(result => result === ModalResult.Yes),
    switchMap(() => this.api.deleteItem(id))
  )
  .subscribe();

// Auto-close when an external signal fires (session ended, timer, hub event)
this.modalieur
  .showUntil(ShareScreenModal, this.hub.sessionEnded$)
  .subscribe(outcome => {
    if (outcome.result === ModalResult.Yes) {
      this.startSharing();
    }
  });

// Hold a ref for imperative work, still react via closed$
const ref = this.modalieur.showAndReturnRef(SpinnerModal, { dismissible: false });
ref.closed$.subscribe(outcome => this.onSaveComplete(outcome));
await this.save();
ref.close(ModalResult.Ok, { savedId });
```

### What you get back

| API | Emits | When |
| --- | ----- | ---- |
| `show(…)` | `ModalOutcome<T>` | User closes or dismisses |
| `confirm()` / `alert()` / `messageBox()` | `ModalResult` | Button click or dismiss |
| `showUntil(…)` / `showUntilCondition(…)` | `ModalOutcome` with `AutoClose` | User action **or** observable fires |
| `showAndReturnRef(…).closed$` | `ModalOutcome<T>` | Same as `show`, but you also hold `ModalRef` |

`ModalOutcome` is `{ result: ModalResult; data?: T }` — one emission, then complete. Treat it like any other one-shot async result in Angular.

## API

### `ModalieurService`

| Method                                               | Description                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `show(component, config?)`                           | Opens a modal; emits the `ModalOutcome` when it closes.                     |
| `showUntil(component, until$, config?)`              | Auto-closes on the **first emission** from `until$`; result is `AutoClose`. |
| `showUntilCondition(component, condition$, config?)` | Auto-closes on the **first truthy** emission; result is `AutoClose`.        |
| `showAndReturnRef(component, config?)`               | Returns a `ModalRef` for programmatic control.                              |
| `messageBox(options, config?)`                       | Opens `MessageBoxDialog`; emits `ModalResult` only.                         |
| `confirm(title, message?, config?)`                  | Yes / No message box; emits `ModalResult`.                                  |
| `alert(title, message?, config?)`                    | Single OK message box; emits `ModalResult`.                                 |

#### `showUntil` vs `showUntilCondition`

|                    | `showUntil`                | `showUntilCondition`                           |
| ------------------ | -------------------------- | ---------------------------------------------- |
| Closes when        | First emission (any value) | First **truthy** emission                      |
| Close result       | `ModalResult.AutoClose`    | `ModalResult.AutoClose`                        |
| `false`, `0`, `''` | **Closes**                 | Ignored — modal stays open                     |
| Typical use        | Timers, one-shot events    | Readiness signals (`loaded$`, `saveComplete$`) |

```ts
import { concat, timer } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

modalieur.showUntil(SpinnerModal, timer(4000).pipe(map(() => false))).subscribe(o => {
  // o.result === ModalResult.AutoClose
});

const ready$ = pollStatus().pipe(
  map(s => s === 'done'),
  filter(Boolean),
  take(1)
);
modalieur.showUntilCondition(SpinnerModal, ready$).subscribe(o => {
  // o.result === ModalResult.AutoClose
});
```

### `ModalRef`

Returned by `showAndReturnRef()`; can also be injected inside a modal component.

| Member                  | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `id`                    | CDK dialog id                                               |
| `closed$`               | `Observable<ModalOutcome<T>>` — emits when the modal closes |
| `close(result?, data?)` | Programmatic close; default result is `Undefined`           |

```ts
const ref = modalieur.showAndReturnRef(SpinnerModal, { dismissible: false });
ref.closed$.subscribe(outcome => {
  /* ... */
});
await save();
ref.close(ModalResult.Ok, { savedId: 42 });
```

### `ModalOutcome<TData>`

```ts
interface ModalOutcome<TData = unknown> {
  result: ModalResult;
  data?: TData;
}
```

Emitted by `show()`, `showUntil()`, `showUntilCondition()`, and `ModalRef.closed$`.

### `ModalContent`

Base class for modal components. Provides protected close helpers:

| Method                  | `ModalResult` |
| ----------------------- | ------------- |
| `yes(data?)`            | `Yes`         |
| `no(data?)`             | `No`          |
| `ok(data?)`             | `Ok`          |
| `cancel(data?)`         | `Cancel`      |
| `abort(data?)`          | `Abort`       |
| `retry(data?)`          | `Retry`       |
| `ignore(data?)`         | `Ignore`      |
| `respondWithData(data)` | `Data`        |
| `close(result?, data?)` | any           |

### `ModalConfig`

`data`, `size` (`ModalSize`: `'sm' | 'lg' | 'xl' | 'fullscreen'`), `centered` (default `true`), `scrollable`,
`dismissible` (default `true`), `backdrop` (default `true`), `unstyled`,
`ariaLabel`, `ariaLabelledBy`, `ariaDescribedBy`.

App-wide defaults: `provideModalieur(...)` → `MODALIEUR_CONFIG` token. Built-in defaults: `MODALIEUR_DEFAULTS`.

Per-call config is merged on top: `{ ...appDefaults, ...perCallConfig }`.

### `ModalResult`

| Value                       | When                                                          |
| --------------------------- | ------------------------------------------------------------- |
| `Undefined`                 | Zero-default safeguard; programmatic `close()` with no result |
| `Data`                      | `respondWithData()`                                           |
| `Yes`, `No`, `Ok`, `Cancel` | Button helpers                                                |
| `Abort`, `Retry`, `Ignore`  | Message-box / helper methods                                  |
| `AutoClose`                 | `showUntil` / `showUntilCondition` auto-close                 |
| `Cancel`                    | User dismissal (backdrop click or Escape)                     |

### `MessageBoxDialog`

Built-in Bootstrap message box (`mdlr-message-box`).

**Shorthand APIs** (emit `ModalResult`; auto-wire `aria-labelledby` / `aria-describedby`):

```ts
modalieur.confirm('Delete item?', 'This cannot be undone.').subscribe(result => {
  if (result === ModalResult.Yes) {
    /* ... */
  }
});

modalieur.alert('Saved', 'Your changes were saved.').subscribe();

modalieur
  .messageBox({ title: 'Retry?', message: 'Connection failed.', buttons: MessageBoxButtons.RetryCancel })
  .subscribe(result => {
    /* Retry | Cancel */
  });
```

**Direct open** (full `ModalOutcome`; set aria attrs yourself or import `MESSAGE_BOX_TITLE_ID` / `MESSAGE_BOX_BODY_ID`):

```ts
modal
  .show(MessageBoxDialog, {
    data: { title: 'Delete?', message: 'Cannot be undone.', buttons: MessageBoxButtons.YesNo }
  })
  .subscribe(o => {
    /* ... */
  });
```

**Content projection** — wrap `<mdlr-message-box>` in your own component:

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

- **Input** — `config.data`, injected via `MODAL_DATA`.
- **Result** — declared by `ModalContent<TResult>`; inferred on `show()` as `ModalResultData<C>`.

```ts
class EditModal extends ModalContent<{ saved: boolean }> {
  data = inject<{ id: number }>(MODAL_DATA);
  protected save = () => this.respondWithData({ saved: true });
}

modal.show(EditModal, { data: { id: 7 } }).subscribe(o => console.log(o.data?.saved));
```

### `MODAL_DATA`

```ts
private readonly data = inject<MyData>(MODAL_DATA);
```

## Testing

See `modalieur.service.spec.ts` for a minimal pattern — provide a fake `Dialog` and assert on `closed` emissions:

```ts
TestBed.configureTestingModule({
  providers: [ModalieurService, { provide: Dialog, useValue: fakeDialog }]
});
```

## License

MIT
