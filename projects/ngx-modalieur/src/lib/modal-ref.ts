import { DialogRef } from '@angular/cdk/dialog';
import { map, Observable } from 'rxjs';

import { ModalOutcome } from './modal-outcome';
import { ModalResult } from './modal-result.enum';

/**
 * Handle to an open modal. Wraps the CDK `DialogRef` so consumers never depend
 * on `@angular/cdk` directly.
 */
export class ModalRef<TData = unknown> {
  /** Unique id of the open modal. */
  readonly id: string;

  /**
   * Emits exactly once when the modal closes. A user dismissal (backdrop click
   * or Escape) resolves to `{ result: ModalResult.Cancel }`, consistent with a
   * close/cancel button. Programmatic `close()` without a result stays
   * `ModalResult.Undefined`.
   */
  readonly closed$: Observable<ModalOutcome<TData>>;

  // The component-type generic is intentionally `any`: it only affects CDK's
  // internal config typing and would otherwise leak variance noise here.
  constructor(private readonly dialogRef: DialogRef<ModalOutcome<TData>, any>) {
    this.id = dialogRef.id;
    this.closed$ = dialogRef.closed.pipe(
      map(outcome => outcome ?? { result: ModalResult.Cancel })
    );
  }

  /**
   * Closes the modal programmatically. Calling without arguments closes with
   * `ModalResult.Undefined` (the equivalent of the old `ref.hide()`).
   */
  close(result: ModalResult = ModalResult.Undefined, data?: TData): void {
    this.dialogRef.close({ result, data });
  }
}
