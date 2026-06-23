import { ModalResult } from '../../modal-result.enum';
import { MessageBoxButton } from './message-box-button';
import { MessageBoxButtons } from './message-box-buttons.enum';

export interface MessageBoxButtonDescriptor {
  label: string;
  cssClass: string;
}

/** Single source of truth for message-box button labels and Bootstrap classes. */
export const MESSAGE_BOX_BUTTON: Partial<Record<ModalResult, MessageBoxButtonDescriptor>> = {
  [ModalResult.Ok]: { label: 'OK', cssClass: 'btn-primary' },
  [ModalResult.Cancel]: { label: 'Cancel', cssClass: 'btn-secondary' },
  [ModalResult.No]: { label: 'No', cssClass: 'btn-secondary' },
  [ModalResult.Yes]: { label: 'Yes', cssClass: 'btn-primary' },
  [ModalResult.Abort]: { label: 'Abort', cssClass: 'btn-danger' },
  [ModalResult.Retry]: { label: 'Retry', cssClass: 'btn-primary' },
  [ModalResult.Ignore]: { label: 'Ignore', cssClass: 'btn-secondary' }
};

export const MESSAGE_BOX_BUTTON_SETS: Record<MessageBoxButtons, ModalResult[]> = {
  [MessageBoxButtons.OK]: [ModalResult.Ok],
  [MessageBoxButtons.OKCancel]: [ModalResult.Ok, ModalResult.Cancel],
  [MessageBoxButtons.AbortRetryIgnore]: [ModalResult.Abort, ModalResult.Retry, ModalResult.Ignore],
  [MessageBoxButtons.YesNoCancel]: [ModalResult.Yes, ModalResult.No, ModalResult.Cancel],
  [MessageBoxButtons.YesNo]: [ModalResult.Yes, ModalResult.No],
  [MessageBoxButtons.RetryCancel]: [ModalResult.Retry, ModalResult.Cancel]
};

export function describeMessageBoxButton(result: ModalResult): MessageBoxButton {
  const descriptor = MESSAGE_BOX_BUTTON[result] ?? MESSAGE_BOX_BUTTON[ModalResult.Ok]!;
  return { result, ...descriptor };
}
