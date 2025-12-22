import { Injectable, signal, WritableSignal } from '@angular/core';
import { Notification } from './notifications';
import { Database, get, ref, set } from '@angular/fire/database';
import { from, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  constructor(private db: Database) {}

  create(
    message: string,
    type: 'info' | 'warning' | 'error'
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'notifications')));

    console.log('Creating notification:', message);

    const subscription = observable.subscribe((data) => {
      const notifications: Notification[] = data.val() || [];
      const nextNotificationId = notifications.length;
      subscription.unsubscribe();

      from(
        set(ref(this.db, `notifications/${nextNotificationId}`), {
          message,
          type,
        })
      ).subscribe({
        next: () => {
          result.next();
        },
        error: (err) => {
          console.error('Error creating notification:', err);
          result.error(err);
        },
      });
    });

    return result.asObservable();
  }

  getAll(): Observable<Notification[]> {
    var result = new Subject<Notification[]>();
    const observable = from(get(ref(this.db, 'notifications')));

    const subscription = observable.subscribe((data) => {
      let notifications: Notification[] = data.val() || [];

      notifications = notifications.filter((notification) => !!notification);
      notifications.forEach((notification, index) => {
        notification.id = index;
      });

      result.next(notifications);

      subscription.unsubscribe();
    });

    return result.asObservable();
  }
}
