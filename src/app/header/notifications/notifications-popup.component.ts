import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { NotificationPopupData } from '../header.component';
import { NotificationsService } from './notifications.service';
import { Notification } from './notifications';
import { take } from 'rxjs';

@Component({
  selector: 'app-notifications-popup',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
  ],
  templateUrl: './notifications-popup.component.html',
  styleUrl: './notifications-popup.component.css',
})
export class NotificationsPopupComponent {
  readonly dialogRef = inject(MatDialogRef<NotificationsPopupComponent>);
  readonly data = inject<NotificationPopupData>(MAT_DIALOG_DATA);
  // readonly notifications = this.data.notifications;
  // readonly animal = model(this.data.animal);

  notifications: WritableSignal<Notification[]> = signal([]);

  constructor(private notificationsService: NotificationsService) {
    notificationsService
      .getAll()
      .pipe(take(1))
      .subscribe((data) => {
        this.notifications.set(data);
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
