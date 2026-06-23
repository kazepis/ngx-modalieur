import { ModalResult } from './modal-result.enum';

export interface ModalOutcome<TData = unknown> {
  result: ModalResult;
  data?: TData;
}
