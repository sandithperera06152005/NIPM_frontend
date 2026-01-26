import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ChequeRegistryDetailComponent } from './cheque-registry-detail.component';

describe('ChequeRegistry Management Detail Component', () => {
  let comp: ChequeRegistryDetailComponent;
  let fixture: ComponentFixture<ChequeRegistryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChequeRegistryDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./cheque-registry-detail.component').then(m => m.ChequeRegistryDetailComponent),
              resolve: { chequeRegistry: () => of({ id: 28975 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ChequeRegistryDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChequeRegistryDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load chequeRegistry on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ChequeRegistryDetailComponent);

      // THEN
      expect(instance.chequeRegistry()).toEqual(expect.objectContaining({ id: 28975 }));
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
