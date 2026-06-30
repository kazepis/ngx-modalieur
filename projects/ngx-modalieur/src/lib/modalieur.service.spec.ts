import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { ModalOutcome } from './modal-outcome';
import { ModalResult } from './modal-result.enum';
import { ModalContent } from './modal-content';
import { ModalieurService } from './modalieur.service';
import { MessageBoxButtons } from './components/message-box/message-box-buttons.enum';

@Component({ standalone: true, template: '' })
class DummyModal extends ModalContent<void, never> {}

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
    this.ref = new FakeDialogRef();
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

  it('showUntil closes on the first emission even when the value is falsy', () => {
    const until = new Subject<boolean>();
    const received: ModalOutcome[] = [];
    service.showUntil(DummyModal, until).subscribe(o => received.push(o));

    until.next(false);
    expect(dialog.ref.closeArgs.length).toBe(1);
    expect(received).toEqual([{ result: ModalResult.AutoClose, data: undefined }]);
  });

  it('showUntilCondition closes only on a truthy emission', () => {
    const condition = new Subject<boolean>();
    const received: ModalOutcome[] = [];
    service.showUntilCondition(DummyModal, condition).subscribe(o => received.push(o));

    condition.next(false);
    expect(dialog.ref.closeArgs.length).toBe(0);

    condition.next(true);
    expect(dialog.ref.closeArgs.length).toBe(1);
    expect(received).toEqual([{ result: ModalResult.AutoClose, data: undefined }]);
  });

  it('showAndReturnRef exposes the id and closes programmatically', () => {
    const ref = service.showAndReturnRef(DummyModal);
    const received: ModalOutcome[] = [];
    ref.closed$.subscribe(o => received.push(o));

    expect(ref.id).toBe('test-id');

    ref.close(ModalResult.Cancel);
    expect(received).toEqual([{ result: ModalResult.Cancel, data: undefined }]);
  });

  it('messageBox emits only the ModalResult', () => {
    const received: ModalResult[] = [];
    service
      .messageBox({ title: 'Delete?', message: 'Sure?', buttons: MessageBoxButtons.YesNo })
      .subscribe(r => received.push(r));

    dialog.ref.close({ result: ModalResult.Yes });
    expect(received).toEqual([ModalResult.Yes]);
  });

  it('confirm and alert delegate to messageBox button sets', () => {
    service.confirm('Confirm', 'Proceed?').subscribe();
    dialog.ref.close({ result: ModalResult.Yes });

    service.alert('Notice', 'Done.').subscribe();
    dialog.ref.close({ result: ModalResult.Ok });
  });
});
