import { ModalResult } from '../../modal-result.enum';
import { MessageBoxButtons } from './message-box-buttons.enum';

export const MESSAGE_BOX_BUTTON_SETS: Record<MessageBoxButtons, ModalResult[]> = {
  [MessageBoxButtons.OK]: [ModalResult.Ok],
  [MessageBoxButtons.OKCancel]: [ModalResult.Ok, ModalResult.Cancel],
  [MessageBoxButtons.AbortRetryIgnore]: [ModalResult.Abort, ModalResult.Retry, ModalResult.Ignore],
  [MessageBoxButtons.YesNoCancel]: [ModalResult.Yes, ModalResult.No, ModalResult.Cancel],
  [MessageBoxButtons.YesNo]: [ModalResult.Yes, ModalResult.No],
  [MessageBoxButtons.RetryCancel]: [ModalResult.Retry, ModalResult.Cancel]
};
