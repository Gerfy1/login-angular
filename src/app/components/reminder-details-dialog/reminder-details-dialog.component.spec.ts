import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderDetailsDialogComponent } from './reminder-details-dialog.component';

describe('ReminderDetailsDialogComponent', () => {
  let component: ReminderDetailsDialogComponent;
  let fixture: ComponentFixture<ReminderDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReminderDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReminderDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
