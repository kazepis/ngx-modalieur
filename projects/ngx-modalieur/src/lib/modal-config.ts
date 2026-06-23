import { ModalSize } from './modal-size';

export interface ModalConfig<TDataIn = unknown> {
  /** Data injected into the modal component via the `MODAL_DATA` token. */
  data?: TDataIn;

  /** Bootstrap dialog size. Omit for the default (medium) size. */
  size?: ModalSize;

  /** Vertically center the dialog (`.modal-dialog-centered`). Default: `true`. */
  centered?: boolean;

  /** Allow the modal body to scroll (`.modal-dialog-scrollable`). Default: `false`. */
  scrollable?: boolean;

  /**
   * Whether clicking the backdrop or pressing Escape closes the modal.
   * Default: `true`. Set to `false` for a non-dismissible (static) modal.
   */
  dismissible?: boolean;

  /** Whether a backdrop element is rendered. Default: `true`. */
  backdrop?: boolean;

  /**
   * Skip the Bootstrap dialog container and render the bare component instead.
   * Default: `false`.
   */
  unstyled?: boolean;

  /** Accessible label for the dialog (maps to CDK `ariaLabel`). */
  ariaLabel?: string | null;

  /** ID of the element that labels the dialog (maps to CDK `ariaLabelledBy`). */
  ariaLabelledBy?: string | null;

  /** ID of the element that describes the dialog (maps to CDK `ariaDescribedBy`). */
  ariaDescribedBy?: string | null;
}
