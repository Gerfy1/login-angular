import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobAplicationListComponent } from './job-aplication-list.component';

describe('JobAplicationListComponent', () => {
  let component: JobAplicationListComponent;
  let fixture: ComponentFixture<JobAplicationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobAplicationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobAplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
