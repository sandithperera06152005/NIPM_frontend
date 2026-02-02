import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AdvancedLevelSubjectDetailComponent } from './advanced-level-subject-detail.component';

describe('AdvancedLevelSubject Management Detail Component', () => {
  let comp: AdvancedLevelSubjectDetailComponent;
  let fixture: ComponentFixture<AdvancedLevelSubjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedLevelSubjectDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./advanced-level-subject-detail.component').then(m => m.AdvancedLevelSubjectDetailComponent),
              resolve: { advancedLevelSubject: () => of({ id: 21506 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(AdvancedLevelSubjectDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedLevelSubjectDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load advancedLevelSubject on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', AdvancedLevelSubjectDetailComponent);

      // THEN
      expect(instance.advancedLevelSubject()).toEqual(expect.objectContaining({ id: 21506 }));
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
