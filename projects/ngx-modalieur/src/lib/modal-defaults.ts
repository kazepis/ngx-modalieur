import { ModalConfig } from './modal-config';

/** Built-in defaults merged with per-call config and app-wide overrides. */
export const MODALIEUR_DEFAULTS: Readonly<ModalConfig> = {
  backdrop: true,
  centered: true,
  dismissible: true,
  scrollable: false,
  unstyled: false
};
