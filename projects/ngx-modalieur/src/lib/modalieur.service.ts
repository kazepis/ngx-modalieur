import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { inject, Injectable, signal, Type } from '@angular/core';
import { filter, map, Observable, take, takeUntil } from 'rxjs';

import { BootstrapDialogContainer } from './components/bootstrap-modal/bootstrap-dialog-container';
import { MessageBoxButtons } from './components/message-box/message-box-buttons.enum';
import { MessageBoxOptions } from './components/message-box/message-box-options';
import { MESSAGE_BOX_BODY_ID, MESSAGE_BOX_TITLE_ID, MessageBoxDialog } from './components/message-box/message-box.dialog';
import { ModalConfig } from './modal-config';
import { ModalContent } from './modal-content';
import { ModalDataIn, ModalDataOut, ShowArgs } from './modal-data-types';
import { MODAL_DATA } from './modal-data.token';
import { MODALIEUR_DEFAULTS } from './modal-defaults';
import { ModalOutcome } from './modal-outcome';
import { ModalRef } from './modal-ref';
import { ModalResult } from './modal-result.enum';
import { MODALIEUR_CONFIG } from './provide-modalieur';

/**
 * Opens Bootstrap-styled modals on top of Angular CDK `Dialog` and exposes the
 * result reactively. The modal is a regular component; close it from inside via
 * `ModalContent` helpers (or by injecting `ModalRef`).
 */
@Injectable({ providedIn: 'root' })
export class ModalieurService {
  private readonly cdkDialog = inject(Dialog);
  private readonly modalieurConfig = signal<ModalConfig>(inject(MODALIEUR_CONFIG, { optional: true }) ?? MODALIEUR_DEFAULTS);

  /**
   * Opens a modal and emits its outcome when it closes. Input and output types
   * are inferred from the component's `ModalContent<TDataIn, TDataOut>` declaration.
   */
  show<C extends ModalContent<any, any>>(
    component: Type<C>,
    ...args: ShowArgs<C>
  ): Observable<ModalOutcome<ModalDataOut<C>>> {
    return this.showAndReturnRef(component, ...args).closed$;
  }

  /**
   * Opens a modal that auto-closes on the **first emission** from `until$`,
   * regardless of value (`false`, `0`, and `''` all count).
   *
   * Use this for timers, one-shot events, or "close when anything happens".
   * For "close when ready", use {@link showUntilCondition} instead.
   *
   * Closes with {@link ModalResult.AutoClose}.
   */
  showUntil<C extends ModalContent<any, any>>(
    component: Type<C>,
    until$: Observable<unknown>,
    ...args: ShowArgs<C>
  ): Observable<ModalOutcome<ModalDataOut<C>>> {
    const ref = this.showAndReturnRef(component, ...args);
    until$.pipe(take(1), takeUntil(ref.closed$)).subscribe(() => ref.close(ModalResult.AutoClose));
    return ref.closed$;
  }

  /**
   * Opens a modal that auto-closes on the **first truthy** emission from
   * `condition$`. Falsy values (`false`, `0`, `''`, `null`, `undefined`) are
   * ignored until a truthy value arrives.
   *
   * Use this for async readiness signals (e.g. `saveComplete$`, `loaded$`).
   * For "close on any emission", use {@link showUntil} instead.
   *
   * Closes with {@link ModalResult.AutoClose}.
   */
  showUntilCondition<C extends ModalContent<any, any>>(
    component: Type<C>,
    condition$: Observable<unknown>,
    ...args: ShowArgs<C>
  ): Observable<ModalOutcome<ModalDataOut<C>>> {
    const ref = this.showAndReturnRef(component, ...args);
    condition$.pipe(filter(Boolean), take(1), takeUntil(ref.closed$)).subscribe(() => ref.close(ModalResult.AutoClose));
    return ref.closed$;
  }

  /** Opens a modal and returns its `ModalRef` for programmatic control. */
  showAndReturnRef<C extends ModalContent<any, any>>(component: Type<C>, ...args: ShowArgs<C>): ModalRef<ModalDataOut<C>> {
    const config = args[0];
    const merged = { ...this.modalieurConfig(), ...config } as ModalConfig<ModalDataIn<C>>;
    const dialogRef = this.cdkDialog.open<ModalOutcome<ModalDataOut<C>>, ModalDataIn<C>, C>(
      component,
      this.toDialogConfig<ModalDataIn<C>, ModalDataOut<C>, C>(merged)
    );
    return new ModalRef<ModalDataOut<C>>(dialogRef);
  }

  /**
   * Opens a config-driven {@link MessageBoxDialog} and emits only the
   * `ModalResult` (not the full `ModalOutcome`).
   */
  messageBox(options: MessageBoxOptions, config?: Omit<ModalConfig<MessageBoxOptions>, 'data'>): Observable<ModalResult> {
    return this.show(MessageBoxDialog, { ...this.withMessageBoxA11y(config), data: options }).pipe(
      map(outcome => outcome.result)
    );
  }

  /** Yes / No confirmation. Shorthand for `messageBox` with `MessageBoxButtons.YesNo`. */
  confirm(title: string, message?: string, config?: Omit<ModalConfig<MessageBoxOptions>, 'data'>): Observable<ModalResult> {
    return this.messageBox({ title, message, buttons: MessageBoxButtons.YesNo }, config);
  }

  /** Single OK button alert. Shorthand for `messageBox` with `MessageBoxButtons.OK`. */
  alert(title: string, message?: string, config?: Omit<ModalConfig<MessageBoxOptions>, 'data'>): Observable<ModalResult> {
    return this.messageBox({ title, message, buttons: MessageBoxButtons.OK }, config);
  }

  private toDialogConfig<TIn, TOut, C>(config: ModalConfig<TIn>): DialogConfig<TIn, DialogRef<ModalOutcome<TOut>, C>> {
    const dialogConfig: DialogConfig<TIn, DialogRef<ModalOutcome<TOut>, C>> = {
      data: config.data,
      disableClose: config.dismissible === false,
      hasBackdrop: config.backdrop !== false,
      backdropClass: ['cdk-overlay-dark-backdrop', 'mdlr-modal-backdrop'],
      panelClass: 'mdlr-modal-pane',
      ariaLabel: config.ariaLabel,
      ariaLabelledBy: config.ariaLabelledBy,
      ariaDescribedBy: config.ariaDescribedBy,
      providers: [
        { provide: MODAL_DATA, useValue: config.data ?? null },
        { provide: ModalRef, useFactory: () => new ModalRef(inject(DialogRef)) }
      ]
    };

    if (!config.unstyled) {
      dialogConfig.container = {
        type: BootstrapDialogContainer,
        providers: () => [{ provide: MODALIEUR_CONFIG, useValue: config }]
      };
    }

    return dialogConfig;
  }

  private withMessageBoxA11y<TIn>(config?: ModalConfig<TIn>): ModalConfig<TIn> {
    return {
      ...config,
      ariaLabelledBy: config?.ariaLabelledBy ?? MESSAGE_BOX_TITLE_ID,
      ariaDescribedBy: config?.ariaDescribedBy ?? MESSAGE_BOX_BODY_ID
    };
  }
}
