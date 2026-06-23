import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

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
class TestModal extends ModalContent {
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
  callData(data: unknown): void {
    this.respondWithData(data);
  }
}

describe('ModalContent', () => {
  let ref: FakeModalRef;
  let modal: TestModal;

  beforeEach(() => {
    ref = new FakeModalRef();
    TestBed.configureTestingModule({
      providers: [{ provide: ModalRef, useValue: ref }]
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
    modal.callData({ name: 'Ada' });
    expect(ref.calls).toEqual([{ result: ModalResult.Data, data: { name: 'Ada' } }]);
  });
});
