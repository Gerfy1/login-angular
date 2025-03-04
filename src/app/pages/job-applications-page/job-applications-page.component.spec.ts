import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationsPageComponent } from './job-applications-page.component';

describe('JobApplicationsPageComponent', () => {
  let component: JobApplicationsPageComponent;
  let fixture: ComponentFixture<JobApplicationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApplicationsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApplicationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
