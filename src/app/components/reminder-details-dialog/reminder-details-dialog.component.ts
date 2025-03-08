import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CalendarEvent } from 'angular-calendar';

@Component({
  selector: 'app-reminder-details-dialog',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './reminder-details-dialog.component.html',
  styleUrl: './reminder-details-dialog.component.scss'
})
export class ReminderDetailsDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { event: CalendarEvent },
    private dialogRef: MatDialogRef<ReminderDetailsDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  edit(): void {
    this.dialogRef.close({ action: 'edit' });
  }

  delete(): void{
    this.dialogRef.close({ action: 'delete'});
  }
}
