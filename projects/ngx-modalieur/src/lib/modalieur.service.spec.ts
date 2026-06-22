import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ModalOutcome } from './modal-outcome';
import { ModalResult } from './modal-result.enum';
import { ModalieurService } from './modalieur.service';

@Component({ standalone: true, template: '' })
class DummyModal {}

class FakeDialogRef {
  id = 'test-id';
  closed = new Subject<unknown>();
  closeArgs: unknown[] = [];

  close(value?: unknown): void {
    this.closeArgs.push(value);
    this.closed.next(value);
    this.closed.complete();
  }
}

class FakeDialog {
  ref = new FakeDialogRef();
  open(): FakeDialogRef {
    return this.ref;
  }
}

describe('ModalieurService', () => {
  let service: ModalieurService;
  let dialog: FakeDialog;

  beforeEach(() => {
    dialog = new FakeDialog();
    TestBed.configureTestingModule({
      providers: [ModalieurService, { provide: Dialog, useValue: dialog }]
    });
    service = TestBed.inject(ModalieurService);
  });

  it('emits the outcome passed to close()', () => {
    const received: ModalOutcome[] = [];
    service.show(DummyModal).subscribe(o => received.push(o));

    dialog.ref.close({ result: ModalResult.Yes, data: { ok: true } });

    expect(received).toEqual([{ result: ModalResult.Yes, data: { ok: true } }]);
  });

  it('maps a user dismissal (backdrop/Escape) to Cancel', () => {
    const received: ModalOutcome[] = [];
    service.show(DummyModal).subscribe(o => received.push(o));

    dialog.ref.close(undefined);

    expect(received).toEqual([{ result: ModalResult.Cancel }]);
  });

  it('showUntilCondition closes only on a truthy emission', () => {
    const condition = new Subject<boolean>();
    const received: ModalOutcome[] = [];
    service.showUntilCondition(DummyModal, condition).subscribe(o => received.push(o));

    condition.next(false);
    expect(dialog.ref.closeArgs.length).toBe(0);

    condition.next(true);
    expect(dialog.ref.closeArgs.length).toBe(1);
    expect(received).toEqual([{ result: ModalResult.Undefined, data: undefined }]);
  });

  it('showAndReturnRef exposes the id and closes programmatically', () => {
    const ref = service.showAndReturnRef(DummyModal);
    const received: ModalOutcome[] = [];
    ref.closed$.subscribe(o => received.push(o));

    expect(ref.id).toBe('test-id');

    ref.close(ModalResult.Cancel);
    expect(received).toEqual([{ result: ModalResult.Cancel, data: undefined }]);
  });
});
