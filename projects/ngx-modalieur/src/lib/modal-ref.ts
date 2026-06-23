import { DialogRef } from '@angular/cdk/dialog';
import { map, Observable } from 'rxjs';

import { ModalOutcome } from './modal-outcome';
import { ModalResult } from './modal-result.enum';

export class ModalRef<TDataOut = unknown> {
  readonly id: string;

  readonly closed$: Observable<ModalOutcome<TDataOut>>;

  constructor(private readonly dialogRef: DialogRef<ModalOutcome<TDataOut>, any>) {
    this.id = dialogRef.id;
    this.closed$ = dialogRef.closed.pipe(map(outcome => outcome ?? { result: ModalResult.Cancel }));
  }

  close(result: ModalResult = ModalResult.Undefined, data?: TDataOut): void {
    this.dialogRef.close({ result, data });
  }
}
