import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MODAL_DATA } from './modal-data.token';
import { ModalContent } from './modal-content';
import { ModalRef } from './modal-ref';
import { ModalResult } from './modal-result.enum';

class FakeModalRef {
  calls: Array<{ result: ModalResult; data: unknown }> = [];
  close(result: ModalResult = ModalResult.Undefined, data?: unknown): void {
    this.calls.push({ result, data });
  }
}

@Component({ standalone: true, template: '' })
class TestModal extends ModalContent<void, never> {
  callYes(): void {
    this.yes();
  }
  callNo(): void {
    this.no();
  }
  callOk(): void {
    this.ok();
  }
  callCancel(): void {
    this.cancel();
  }
  callAbort(): void {
    this.abort();
  }
  callRetry(): void {
    this.retry();
  }
  callIgnore(): void {
    this.ignore();
  }
}

@Component({ standalone: true, template: '' })
class DataModal extends ModalContent<void, { name: string }> {
  callData(name: string): void {
    this.respondWithData({ name });
  }
}

@Component({ standalone: true, template: '' })
class TypedModal extends ModalContent<{ id: number }, { ok: boolean }> {
  callCloseWithoutData(): void {
    this.close(ModalResult.Ok);
  }
  callCloseWithData(): void {
    this.close(ModalResult.Ok, { ok: true });
  }
  callRespondWithData(): void {
    this.respondWithData({ ok: true });
  }
}

describe('ModalContent', () => {
  let ref: FakeModalRef;
  let modal: TestModal;

  beforeEach(() => {
    ref = new FakeModalRef();
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalRef, useValue: ref },
        { provide: MODAL_DATA, useValue: null }
      ]
    });
    modal = TestBed.createComponent(TestModal).componentInstance;
  });

  it('maps helpers to the matching ModalResult', () => {
    modal.callYes();
    modal.callNo();
    modal.callOk();
    modal.callCancel();
    modal.callAbort();
    modal.callRetry();
    modal.callIgnore();

    expect(ref.calls).toEqual([
      { result: ModalResult.Yes, data: undefined },
      { result: ModalResult.No, data: undefined },
      { result: ModalResult.Ok, data: undefined },
      { result: ModalResult.Cancel, data: undefined },
      { result: ModalResult.Abort, data: undefined },
      { result: ModalResult.Retry, data: undefined },
      { result: ModalResult.Ignore, data: undefined }
    ]);
  });

  it('respondWithData closes with Data and the payload', () => {
    const dataModal = TestBed.createComponent(DataModal).componentInstance;
    dataModal.callData('Ada');
    expect(ref.calls).toEqual([{ result: ModalResult.Data, data: { name: 'Ada' } }]);
  });
});

describe('ModalContent typed output', () => {
  let ref: FakeModalRef;
  let modal: TypedModal;

  beforeEach(() => {
    ref = new FakeModalRef();
    TestBed.configureTestingModule({
      providers: [
        { provide: ModalRef, useValue: ref },
        { provide: MODAL_DATA, useValue: { id: 1 } }
      ]
    });
    modal = TestBed.createComponent(TypedModal).componentInstance;
  });

  it('allows closing with or without output data when TDataOut is concrete', () => {
    modal.callCloseWithoutData();
    modal.callCloseWithData();

    expect(ref.calls).toEqual([
      { result: ModalResult.Ok, data: undefined },
      { result: ModalResult.Ok, data: { ok: true } }
    ]);
  });

  it('respondWithData closes with Data and the typed payload', () => {
    modal.callRespondWithData();
    expect(ref.calls).toEqual([{ result: ModalResult.Data, data: { ok: true } }]);
  });
});
