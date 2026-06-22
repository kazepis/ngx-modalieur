import { Directive, inject } from '@angular/core';

import { ModalRef } from './modal-ref';
import { ModalResult } from './modal-result.enum';

/**
 * Optional base class for modal components. Provides Windows-Forms-style
 * helpers that close the modal with a `ModalResult`. Components may instead
 * inject `ModalRef` directly.
 *
 * @example
 * ```ts
 * export class ConfirmLogoutComponent extends ModalContent {}
 * // template: <button (click)="yes()">Logout</button>
 * ```
 */
@Directive()
export abstract class ModalContent<TData = unknown> {
  protected readonly modalRef = inject<ModalRef<TData>>(ModalRef);

  protected yes(data?: TData): void {
    this.close(ModalResult.Yes, data);
  }

  protected no(data?: TData): void {
    this.close(ModalResult.No, data);
  }

  protected ok(data?: TData): void {
    this.close(ModalResult.Ok, data);
  }

  protected cancel(data?: TData): void {
    this.close(ModalResult.Cancel, data);
  }

  protected respondWithData(data: TData): void {
    this.close(ModalResult.Data, data);
  }

  protected close(result: ModalResult = ModalResult.Undefined, data?: TData): void {
    this.modalRef.close(result, data);
  }
}
