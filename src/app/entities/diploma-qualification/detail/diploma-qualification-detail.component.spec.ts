import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { DiplomaQualificationDetailComponent } from './diploma-qualification-detail.component';

describe('DiplomaQualification Management Detail Component', () => {
  let comp: DiplomaQualificationDetailComponent;
  let fixture: ComponentFixture<DiplomaQualificationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiplomaQualificationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./diploma-qualification-detail.component').then(m => m.DiplomaQualificationDetailComponent),
              resolve: { diplomaQualification: () => of({ id: 25116 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(DiplomaQualificationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiplomaQualificationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load diplomaQualification on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', DiplomaQualificationDetailComponent);

      // THEN
      expect(instance.diplomaQualification()).toEqual(expect.objectContaining({ id: 25116 }));
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
