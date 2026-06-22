import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { inject, Injectable, signal, Type } from '@angular/core';
import { filter, Observable, take, takeUntil } from 'rxjs';

import { BOOTSTRAP_MODAL_OPTIONS } from './bootstrap-modal-options';
import { BootstrapDialogContainer } from './bootstrap-dialog-container';
import { ModalConfig } from './modal-config';
import { ModalResultData } from './modal-content';
import { MODAL_DATA } from './modal-data.token';
import { ModalOutcome } from './modal-outcome';
import { ModalRef } from './modal-ref';
import { MODALIEUR_DEFAULT_CONFIG } from './provide-modalieur';

/**
 * Opens Bootstrap-styled modals on top of Angular CDK `Dialog` and exposes the
 * result reactively. The modal is a regular component; close it from inside via
 * `ModalContent` helpers (or by injecting `ModalRef`).
 */
@Injectable({ providedIn: 'root' })
export class ModalieurService {
  private readonly dialog = inject(Dialog);
  private readonly defaults = signal<ModalConfig>(inject(MODALIEUR_DEFAULT_CONFIG, { optional: true }) ?? {});

  /** Opens a modal and emits its outcome when it closes. */
  show<C, TData = ModalResultData<C>>(
    component: Type<C>,
    config?: ModalConfig<TData>
  ): Observable<ModalOutcome<TData>> {
    return this.showAndReturnRef<C, TData>(component, config).closed$;
  }

  /** Opens a modal that auto-closes when `until$` emits anything. */
  showUntil<C, TData = ModalResultData<C>>(
    component: Type<C>,
    until$: Observable<unknown>,
    config?: ModalConfig<TData>
  ): Observable<ModalOutcome<TData>> {
    const ref = this.showAndReturnRef<C, TData>(component, config);
    until$.pipe(take(1), takeUntil(ref.closed$)).subscribe(() => ref.close());
    return ref.closed$;
  }

  /** Opens a modal that auto-closes when `condition$` emits a truthy value. */
  showUntilCondition<C, TData = ModalResultData<C>>(
    component: Type<C>,
    condition$: Observable<unknown>,
    config?: ModalConfig<TData>
  ): Observable<ModalOutcome<TData>> {
    const ref = this.showAndReturnRef<C, TData>(component, config);
    condition$.pipe(filter(Boolean), take(1), takeUntil(ref.closed$)).subscribe(() => ref.close());
    return ref.closed$;
  }

  /** Opens a modal and returns its `ModalRef` for programmatic control. */
  showAndReturnRef<C, TData = ModalResultData<C>>(
    component: Type<C>,
    config?: ModalConfig<TData>
  ): ModalRef<TData> {
    const merged = { ...this.defaults(), ...config } as ModalConfig<TData>;
    const dialogRef = this.dialog.open<ModalOutcome<TData>, TData, C>(component, this.toDialogConfig<TData, C>(merged));
    return new ModalRef<TData>(dialogRef);
  }

  private toDialogConfig<TData, C>(config: ModalConfig<TData>): DialogConfig<TData, DialogRef<ModalOutcome<TData>, C>> {
    const dialogConfig: DialogConfig<TData, DialogRef<ModalOutcome<TData>, C>> = {
      data: config.data,
      disableClose: config.dismissible === false,
      hasBackdrop: config.backdrop !== false,
      backdropClass: ['cdk-overlay-dark-backdrop', 'mdlr-modal-backdrop'],
      panelClass: 'mdlr-modal-pane',
      providers: [
        { provide: MODAL_DATA, useValue: config.data ?? null },
        { provide: ModalRef, useFactory: () => new ModalRef(inject(DialogRef)) }
      ]
    };

    if (!config.unstyled) {
      dialogConfig.container = {
        type: BootstrapDialogContainer,
        providers: () => [
          {
            provide: BOOTSTRAP_MODAL_OPTIONS,
            useValue: { size: config.size, centered: config.centered, scrollable: config.scrollable }
          }
        ]
      };
    }

    return dialogConfig;
  }
}
