import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { VendorPaymentsDetailComponent } from './vendor-payments-detail.component';

describe('VendorPayments Management Detail Component', () => {
  let comp: VendorPaymentsDetailComponent;
  let fixture: ComponentFixture<VendorPaymentsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorPaymentsDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./vendor-payments-detail.component').then(m => m.VendorPaymentsDetailComponent),
              resolve: { vendorPayments: () => of({ id: 20190 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(VendorPaymentsDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorPaymentsDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load vendorPayments on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', VendorPaymentsDetailComponent);

      // THEN
      expect(instance.vendorPayments()).toEqual(expect.objectContaining({ id: 20190 }));
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
