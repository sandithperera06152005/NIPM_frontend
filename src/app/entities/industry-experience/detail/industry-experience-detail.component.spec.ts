import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { IndustryExperienceDetailComponent } from './industry-experience-detail.component';

describe('IndustryExperience Management Detail Component', () => {
  let comp: IndustryExperienceDetailComponent;
  let fixture: ComponentFixture<IndustryExperienceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryExperienceDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./industry-experience-detail.component').then(m => m.IndustryExperienceDetailComponent),
              resolve: { industryExperience: () => of({ id: 16525 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(IndustryExperienceDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IndustryExperienceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load industryExperience on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', IndustryExperienceDetailComponent);

      // THEN
      expect(instance.industryExperience()).toEqual(expect.objectContaining({ id: 16525 }));
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
