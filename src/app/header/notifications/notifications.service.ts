import { Injectable } from '@angular/core';
import { Notification } from './notifications';
import { Database, get, ref, set, update } from '@angular/fire/database';
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
          read: false,
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

  markAsRead(id: number): Observable<void> {
    const subject = new Subject<void>();

    this.getById(id).subscribe((notification) => {
      if (!!notification) {
        from(
          update(ref(this.db, 'notifications/' + id), {
            message: notification.message,
            type: notification.type,
            read: true,
          })
        ).subscribe((data) => {
          console.info(`Notification ${id} was marked as read`);
          // this.router.navigate(['/home']);

          subject.next();
          subject.complete();
        });
      }
    });

    return subject.asObservable();
  }

  markAllAsRead(): Observable<void> {
    const subject = new Subject<void>();

    this.getAll().subscribe((notifications) => {
      const updates: any = {};
      notifications.forEach((notification) => {
        updates[`notifications/${notification.id}`] = {
          message: notification.message,
          type: notification.type,
          read: true,
        };
      });

      from(update(ref(this.db), updates)).subscribe(() => {
        subject.next();
        subject.complete();
      });
    });

    return subject.asObservable();
  }

  getById(id: number): Observable<Notification | null> {
    const observable = from(get(ref(this.db, `notifications/${id}`)));

    var found = new Subject<Notification | null>();
    observable.subscribe({
      next: (data) => {
        const notification: Notification = data.val();
        if (notification) {
          notification.id = id;
        }
        found.next(notification);
      },
      error: (err) => {
        console.error('Error loading notification by ID:', err);
        found.next(null);
      },
    });

    return found.asObservable();
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
