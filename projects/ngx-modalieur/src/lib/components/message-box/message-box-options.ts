import { MessageBoxButtons } from './message-box-buttons.enum';

/** Options for a config-driven `MessageBoxDialog`. */

export interface MessageBoxOptions {
  title?: string;
  message?: string;
  /** Which buttons to render. Defaults to `MessageBoxButtons.OK`. */
  buttons?: MessageBoxButtons;
}
