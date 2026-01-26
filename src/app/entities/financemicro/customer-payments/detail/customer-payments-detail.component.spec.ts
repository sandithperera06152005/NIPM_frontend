import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { CustomerPaymentsDetailComponent } from './customer-payments-detail.component';

describe('CustomerPayments Management Detail Component', () => {
  let comp: CustomerPaymentsDetailComponent;
  let fixture: ComponentFixture<CustomerPaymentsDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerPaymentsDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./customer-payments-detail.component').then(m => m.CustomerPaymentsDetailComponent),
              resolve: { customerPayments: () => of({ id: 526 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(CustomerPaymentsDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPaymentsDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load customerPayments on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', CustomerPaymentsDetailComponent);

      // THEN
      expect(instance.customerPayments()).toEqual(expect.objectContaining({ id: 526 }));
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
