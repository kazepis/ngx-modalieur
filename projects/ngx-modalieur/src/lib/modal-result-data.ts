import { ModalContent } from './modal-content';

export type ModalResultData<C> = C extends ModalContent<infer TData> ? TData : unknown;
