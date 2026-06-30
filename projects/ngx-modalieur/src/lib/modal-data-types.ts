import { ModalConfig } from './modal-config';
import { ModalContent } from './modal-content';

/** Extracts the input data type declared on a `ModalContent` component. */
export type ModalDataIn<C> = C extends ModalContent<infer TIn, any> ? TIn : never;

/** Extracts the output data type declared on a `ModalContent` component. */
export type ModalDataOut<C> = C extends ModalContent<any, infer TOut> ? TOut : never;

/** Call-site argument tuple: `config` is optional when input is `void`, required with `data` otherwise. */
export type ShowArgs<C> =
  ModalDataIn<C> extends void
    ? [config?: ModalConfig<ModalDataIn<C>>]
    : [config: ModalConfig<ModalDataIn<C>> & { data: ModalDataIn<C> }];
