import { ModalResult } from '../../modal-result.enum';

export interface MessageBoxButton {
  result: ModalResult;
  label: string;
  cssClass: string;
}
