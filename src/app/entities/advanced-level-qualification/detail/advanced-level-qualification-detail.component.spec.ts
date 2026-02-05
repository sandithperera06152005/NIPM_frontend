import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AdvancedLevelQualificationDetailComponent } from './advanced-level-qualification-detail.component';

describe('AdvancedLevelQualification Management Detail Component', () => {
  let comp: AdvancedLevelQualificationDetailComponent;
  let fixture: ComponentFixture<AdvancedLevelQualificationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedLevelQualificationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () =>
                import('./advanced-level-qualification-detail.component').then(m => m.AdvancedLevelQualificationDetailComponent),
              resolve: { advancedLevelQualification: () => of({ id: 31324 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(AdvancedLevelQualificationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedLevelQualificationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load advancedLevelQualification on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', AdvancedLevelQualificationDetailComponent);

      // THEN
      expect(instance.advancedLevelQualification()).toEqual(expect.objectContaining({ id: 31324 }));
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
