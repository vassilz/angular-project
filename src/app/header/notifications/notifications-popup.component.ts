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

  isRead(id: number): boolean {
    const notification = this.notifications().find(
      (notification) => notification.id === id
    );
    return (
      notification?.receivers.find(
        (receiver) => receiver.uuid === this.data.uuid
      )?.read ?? false
    );
  }

  constructor(private notificationsService: NotificationsService) {
    notificationsService
      .getAll()
      .pipe(take(1))
      .subscribe((notifications) => {
        const notificationsForUser = notifications.filter((notification) =>
          notification.receivers?.some(
            (receiver) => receiver.uuid === this.data.uuid
          )
        );
        this.notifications.set(notificationsForUser);
      });
  }

  markAsRead(id: number) {
    this.notificationsService.markAsRead(id).subscribe((data) => {
      this.notifications()
        .find((notification) => notification.id === id)!
        .receivers.find((receiver) => receiver.uuid === this.data.uuid)!.read =
        true;
    });
  }

  markAllAsRead() {
    this.notificationsService.markAllAsRead().subscribe(() => {
      this.notifications().forEach((notification) => {
        notification.receivers.find(
          (receiver) => receiver.uuid === this.data.uuid
        )!.read = true;
      });
    });
  }

  dismiss(id: number) {
    this.notificationsService.dismiss(id).subscribe(() => {
      this.notifications.set(
        this.notifications().filter((notification) => notification.id !== id)
      );
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
