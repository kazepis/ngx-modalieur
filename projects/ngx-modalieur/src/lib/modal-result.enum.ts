/**
 * Outcome kind returned by a modal, modelled after the Windows Forms
 * `DialogResult`. `Undefined` is intentionally `0` so an uninitialized
 * variable defaults to a safe "no result" value.
 */
export enum ModalResult {
  Undefined = 0,
  Data,
  Yes,
  No,
  Ok,
  Cancel
}
