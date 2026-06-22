/** Bootstrap modal size modifier. The default (omitted) size is medium. */
export type ModalSize = 'sm' | 'lg' | 'xl' | 'fullscreen';

/**
 * Options for opening a modal. All fields are optional; sensible defaults are
 * applied by `ModalieurService` (and can be overridden app-wide via
 * `provideModalieur`).
 */
export interface ModalConfig<TData = unknown> {
  /** Data injected into the modal component via the `MODAL_DATA` token. */
  data?: TData;

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
}
