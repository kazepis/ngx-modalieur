import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRef } from '../../modal-ref';
import { ModalResult } from '../../modal-result.enum';
import { MODAL_DATA } from '../../modal-data.token';
import { MESSAGE_BOX_BUTTON_SETS } from './message-box-buttons.config';
import { MessageBoxButtons } from './message-box-buttons.enum';
import { MessageBoxDialog } from './message-box.dialog';

class FakeModalRef {
  calls: ModalResult[] = [];
  close(result: ModalResult = ModalResult.Undefined): void {
    this.calls.push(result);
  }
}

describe('MessageBoxDialog', () => {
  let fixture: ComponentFixture<MessageBoxDialog>;
  let modalRef: FakeModalRef;

  function create(buttons: MessageBoxButtons): void {
    TestBed.resetTestingModule();
    modalRef = new FakeModalRef();
    TestBed.configureTestingModule({
      imports: [MessageBoxDialog],
      providers: [
        { provide: ModalRef, useValue: modalRef },
        { provide: MODAL_DATA, useValue: { title: 'Test', message: 'Body', buttons } }
      ]
    });
    fixture = TestBed.createComponent(MessageBoxDialog);
    fixture.detectChanges();
  }

  it('renders the buttons defined by each MessageBoxButtons set', () => {
    const sets = [
      MessageBoxButtons.OK,
      MessageBoxButtons.OKCancel,
      MessageBoxButtons.AbortRetryIgnore,
      MessageBoxButtons.YesNoCancel,
      MessageBoxButtons.YesNo,
      MessageBoxButtons.RetryCancel
    ];

    for (const buttons of sets) {
      create(buttons);
      const labels = (Array.from(fixture.nativeElement.querySelectorAll('.modal-footer button')) as HTMLElement[]).map(el =>
        el.textContent?.trim()
      );
      expect(labels.length).toBe(MESSAGE_BOX_BUTTON_SETS[buttons].length);
      fixture.destroy();
    }
  });

  it('maps OKCancel clicks to ModalResult.Ok and ModalResult.Cancel', () => {
    create(MessageBoxButtons.OKCancel);
    const buttons = fixture.nativeElement.querySelectorAll('.modal-footer button');
    buttons[0].click();
    buttons[1].click();
    expect(modalRef.calls).toEqual([ModalResult.Ok, ModalResult.Cancel]);
  });

  it('maps YesNoCancel clicks to Yes, No, and Cancel', () => {
    create(MessageBoxButtons.YesNoCancel);
    const buttons = fixture.nativeElement.querySelectorAll('.modal-footer button');
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();
    expect(modalRef.calls).toEqual([ModalResult.Yes, ModalResult.No, ModalResult.Cancel]);
  });

  it('maps AbortRetryIgnore clicks to Abort, Retry, and Ignore', () => {
    create(MessageBoxButtons.AbortRetryIgnore);
    const buttons = fixture.nativeElement.querySelectorAll('.modal-footer button');
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();
    expect(modalRef.calls).toEqual([ModalResult.Abort, ModalResult.Retry, ModalResult.Ignore]);
  });
});
