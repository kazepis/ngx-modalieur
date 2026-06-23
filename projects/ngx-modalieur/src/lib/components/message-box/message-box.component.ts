import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ModalContent } from '../../modal-content';
import { MODAL_DATA } from '../../modal-data.token';
import { ModalResult } from '../../modal-result.enum';
import { MESSAGE_BOX_BUTTON_SETS } from './button-sets';
import { MessageBoxButton } from './message-box-button';
import { MessageBoxButtons } from './message-box-buttons.enum';
import { MessageBoxOptions } from './message-box-options';

/**
 * A Bootstrap-styled message box. Use it two ways:
 *
 * 1. Config-driven — open it directly with `{ data: { title, message, buttons } }`.
 * 2. Content projection — place `<mdlr-message-box>` in your own component and
 *    project `[mbHeader]`, `[mbBody]`, `[mbFooter]`.
 */
@Component({
  selector: 'mdlr-message-box',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-header">
      <ng-content select="[mbHeader]">
        <h5 class="modal-title">{{ title }}</h5>
        <button type="button" class="btn-close" aria-label="Close" (click)="close(Result.Cancel)"></button>
      </ng-content>
    </div>
    <div class="modal-body">
      <ng-content select="[mbBody]">{{ message }}</ng-content>
    </div>
    <div class="modal-footer">
      <ng-content select="[mbFooter]">
        @for (button of buttons; track button.result) {
          <button type="button" class="btn {{ button.cssClass }}" (click)="close(button.result)">
            {{ button.label }}
          </button>
        }
      </ng-content>
    </div>
  `
})
export class MessageBoxDialog extends ModalContent {
  protected readonly Result = ModalResult;

  private readonly options = inject<MessageBoxOptions | null>(MODAL_DATA, { optional: true }) ?? {};

  protected get title(): string {
    return this.options.title ?? '';
  }

  protected get message(): string {
    return this.options.message ?? '';
  }

  protected get buttons(): MessageBoxButton[] {
    return MESSAGE_BOX_BUTTON_SETS[this.options.buttons ?? MessageBoxButtons.OK].map(b => this.describeButton(b));
  }

  private describeButton(result: ModalResult): MessageBoxButton {
    switch (result) {
      case ModalResult.Cancel:
        return { result, label: 'Cancel', cssClass: 'btn-secondary' };
      case ModalResult.No:
        return { result, label: 'No', cssClass: 'btn-secondary' };
      case ModalResult.Abort:
        return { result, label: 'Abort', cssClass: 'btn-danger' };
      case ModalResult.Retry:
        return { result, label: 'Retry', cssClass: 'btn-primary' };
      case ModalResult.Ignore:
        return { result, label: 'Ignore', cssClass: 'btn-secondary' };
      case ModalResult.Yes:
        return { result, label: 'Yes', cssClass: 'btn-primary' };
      case ModalResult.Continue:
        return { result, label: 'Continue', cssClass: 'btn-primary' };
      case ModalResult.Ok:
      default:
        return { result, label: 'OK', cssClass: 'btn-primary' };
    }
  }
}
