import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';
import { inject, Injectable, signal, Type } from '@angular/core';
import { filter, Observable, take, takeUntil } from 'rxjs';

import { BootstrapDialogContainer } from './components/bootstrap-modal/bootstrap-dialog-container';
import { ModalConfig } from './modal-config';
import { MODAL_DATA } from './modal-data.token';
import { ModalOutcome } from './modal-outcome';
import { ModalRef } from './modal-ref';
import { ModalResultData } from './modal-result-data';
import { MODALIEUR_DEFAULT_CONFIG } from './provide-modalieur';

/**
 * Opens Bootstrap-styled modals on top of Angular CDK `Dialog` and exposes the
 * result reactively. The modal is a regular component; close it from inside via
 * `ModalContent` helpers (or by injecting `ModalRef`).
 */
@Injectable({ providedIn: 'root' })
export class ModalieurService {
  private readonly cdkDialog = inject(Dialog);
  private readonly modalieurDefaultConfig = signal<ModalConfig>(inject(MODALIEUR_DEFAULT_CONFIG, { optional: true }) ?? {});

  /**
   * Opens a modal and emits its outcome when it closes. `TIn` is the input data
   * type (from `config.data`); the result-data type is inferred from the
   * component's `ModalContent` base.
   */
  show<C, TIn = unknown>(component: Type<C>, config?: ModalConfig<TIn>): Observable<ModalOutcome<ModalResultData<C>>> {
    return this.showAndReturnRef<C, TIn>(component, config).closed$;
  }

  /** Opens a modal that auto-closes when `until$` emits anything. */
  showUntil<C, TIn = unknown>(
    component: Type<C>,
    until$: Observable<unknown>,
    config?: ModalConfig<TIn>
  ): Observable<ModalOutcome<ModalResultData<C>>> {
    const ref = this.showAndReturnRef<C, TIn>(component, config);
    until$.pipe(take(1), takeUntil(ref.closed$)).subscribe(() => ref.close());
    return ref.closed$;
  }

  /** Opens a modal that auto-closes when `condition$` emits a truthy value. */
  showUntilCondition<C, TIn = unknown>(
    component: Type<C>,
    condition$: Observable<unknown>,
    config?: ModalConfig<TIn>
  ): Observable<ModalOutcome<ModalResultData<C>>> {
    const ref = this.showAndReturnRef<C, TIn>(component, config);
    condition$.pipe(filter(Boolean), take(1), takeUntil(ref.closed$)).subscribe(() => ref.close());
    return ref.closed$;
  }

  /** Opens a modal and returns its `ModalRef` for programmatic control. */
  showAndReturnRef<C, TIn = unknown>(component: Type<C>, config?: ModalConfig<TIn>): ModalRef<ModalResultData<C>> {
    const merged = { ...this.modalieurDefaultConfig(), ...config } as ModalConfig<TIn>;
    const dialogRef = this.cdkDialog.open<ModalOutcome<ModalResultData<C>>, TIn, C>(
      component,
      this.toDialogConfig<TIn, ModalResultData<C>, C>(merged)
    );
    return new ModalRef<ModalResultData<C>>(dialogRef);
  }

  private toDialogConfig<TIn, TOut, C>(config: ModalConfig<TIn>): DialogConfig<TIn, DialogRef<ModalOutcome<TOut>, C>> {
    const dialogConfig: DialogConfig<TIn, DialogRef<ModalOutcome<TOut>, C>> = {
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
      // Forward the resolved (merged) config to the container's injector so it
      // can apply per-modal size / centered / scrollable, falling back to the
      // app-wide MODALIEUR_DEFAULT_CONFIG only when nothing is passed.
      dialogConfig.container = {
        type: BootstrapDialogContainer,
        providers: () => [{ provide: MODALIEUR_DEFAULT_CONFIG, useValue: config }]
      };
    }

    return dialogConfig;
  }
}
