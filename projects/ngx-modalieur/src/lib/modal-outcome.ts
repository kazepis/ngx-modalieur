import { ModalResult } from './modal-result.enum';

/**
 * The value emitted when a modal closes. `data` is populated when the modal
 * responds with a payload (typically alongside `ModalResult.Data`).
 */
export interface ModalOutcome<TData = unknown> {
  result: ModalResult;
  data?: TData;
}
