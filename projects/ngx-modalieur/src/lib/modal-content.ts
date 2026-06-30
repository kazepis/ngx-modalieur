import { Directive, inject } from '@angular/core';

import { MODAL_DATA } from './modal-data.token';
import { ModalRef } from './modal-ref';
import { ModalResult } from './modal-result.enum';

@Directive()
export abstract class ModalContent<TDataIn = void, TDataOut = never> {
  protected readonly data = inject<TDataIn>(MODAL_DATA, { optional: true }) as TDataIn;
  protected readonly modalRef = inject(ModalRef);

  protected yes(data?: TDataOut): void {
    this.close(ModalResult.Yes, data);
  }

  protected no(data?: TDataOut): void {
    this.close(ModalResult.No, data);
  }

  protected ok(data?: TDataOut): void {
    this.close(ModalResult.Ok, data);
  }

  protected cancel(data?: TDataOut): void {
    this.close(ModalResult.Cancel, data);
  }

  protected abort(data?: TDataOut): void {
    this.close(ModalResult.Abort, data);
  }

  protected retry(data?: TDataOut): void {
    this.close(ModalResult.Retry, data);
  }

  protected ignore(data?: TDataOut): void {
    this.close(ModalResult.Ignore, data);
  }

  protected respondWithData(data: TDataOut): void {
    this.close(ModalResult.Data, data);
  }

  protected close(result: ModalResult = ModalResult.Undefined, data?: TDataOut): void {
    this.modalRef.close(result, data);
  }
}
