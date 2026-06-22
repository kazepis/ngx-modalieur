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
   * Emits exactly once when the modal closes. A dismissal (backdrop click /
   * Escape) resolves to `{ result: ModalResult.Undefined }`.
   */
  readonly closed$: Observable<ModalOutcome<TData>>;

  constructor(private readonly dialogRef: DialogRef<ModalOutcome<TData>>) {
    this.id = dialogRef.id;
    this.closed$ = dialogRef.closed.pipe(
      map(outcome => outcome ?? { result: ModalResult.Undefined })
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
