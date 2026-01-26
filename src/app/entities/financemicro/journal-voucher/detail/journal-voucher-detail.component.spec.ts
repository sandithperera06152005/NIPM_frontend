import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { JournalVoucherDetailComponent } from './journal-voucher-detail.component';

describe('JournalVoucher Management Detail Component', () => {
  let comp: JournalVoucherDetailComponent;
  let fixture: ComponentFixture<JournalVoucherDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalVoucherDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./journal-voucher-detail.component').then(m => m.JournalVoucherDetailComponent),
              resolve: { journalVoucher: () => of({ id: 14827 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(JournalVoucherDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalVoucherDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load journalVoucher on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', JournalVoucherDetailComponent);

      // THEN
      expect(instance.journalVoucher()).toEqual(expect.objectContaining({ id: 14827 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
