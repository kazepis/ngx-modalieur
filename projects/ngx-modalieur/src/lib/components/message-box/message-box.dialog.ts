import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ModalContent } from '../../modal-content';
import { MODAL_DATA } from '../../modal-data.token';
import { ModalResult } from '../../modal-result.enum';
import { describeMessageBoxButton, MESSAGE_BOX_BUTTON_SETS } from './message-box-buttons.config';
import { MessageBoxButton } from './message-box-button';
import { MessageBoxButtons } from './message-box-buttons.enum';
import { MessageBoxOptions } from './message-box-options';

/** DOM id for the config-driven message-box title (used with aria-labelledby). */
export const MESSAGE_BOX_TITLE_ID = 'mdlr-message-box-title';

/** DOM id for the config-driven message-box body (used with aria-describedby). */
export const MESSAGE_BOX_BODY_ID = 'mdlr-message-box-body';

/**
 * A Bootstrap-styled message box. Use it two ways:
 *
 * 1. Config-driven — `modalieur.messageBox({ title, message, buttons })`.
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
        <h5 class="modal-title" [attr.id]="titleId">{{ title }}</h5>
        <button type="button" class="btn-close" aria-label="Close" (click)="close(Result.Cancel)"></button>
      </ng-content>
    </div>
    <div class="modal-body" [attr.id]="bodyId">
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
  protected readonly titleId = MESSAGE_BOX_TITLE_ID;
  protected readonly bodyId = MESSAGE_BOX_BODY_ID;

  private readonly options = inject<MessageBoxOptions | null>(MODAL_DATA, { optional: true }) ?? {};

  protected get title(): string {
    return this.options.title ?? '';
  }

  protected get message(): string {
    return this.options.message ?? '';
  }

  protected get buttons(): MessageBoxButton[] {
    return MESSAGE_BOX_BUTTON_SETS[this.options.buttons ?? MessageBoxButtons.OK].map(describeMessageBoxButton);
  }
}
