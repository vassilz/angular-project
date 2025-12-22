import { Injectable } from '@angular/core';
import {
  Notification,
  NotificationReceiver,
  NotificationType,
} from './notifications';
import { Database, get, ref, set, update } from '@angular/fire/database';
import { from, Observable, Subject } from 'rxjs';
import { AuthenticationService } from '../../authentication.service';
import { FirebaseUserService } from '../../users/firebase-user.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  uuid: string | null = null;

  constructor(
    private db: Database,
    private authenticationService: AuthenticationService,
    private userService: FirebaseUserService
  ) {
    this.authenticationService.user$.subscribe((loggedInUser) => {
      this.uuid = loggedInUser?.uid || null;
    });
  }

  create(
    message: string,
    type: 'info' | 'warning' | 'error',
    eventType: NotificationType,
    bookId?: number
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, 'notifications')));

    console.log('Creating notification:', message);

    const subscription = observable.subscribe((data) => {
      const notifications: Notification[] = data.val() || [];
      const nextNotificationId = notifications.length;
      subscription.unsubscribe();

      this.getSubscribersFor(eventType, bookId).subscribe((uuids) => {
        from(
          set(ref(this.db, `notifications/${nextNotificationId}`), {
            message,
            type,
            read: false,
            receivers: this.mapToReceivers(uuids),
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
    });

    return result.asObservable();
  }

  markAsRead(id: number): Observable<void> {
    const subject = new Subject<void>();

    this.getById(id).subscribe((notification) => {
      if (!!notification) {
        const updatedReceivers: NotificationReceiver[] =
          notification.receivers.map((receiver) => {
            if (receiver.uuid === this.uuid) {
              return { ...receiver, read: true };
            }
            return receiver;
          });

        from(
          update(ref(this.db, 'notifications/' + id), {
            message: notification.message,
            type: notification.type,
            receivers: updatedReceivers,
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
        const updatedReceivers: NotificationReceiver[] =
          notification.receivers.map((receiver) => {
            if (receiver.uuid === this.uuid) {
              return { ...receiver, read: true };
            }
            return receiver;
          });

        updates[`notifications/${notification.id}`] = {
          message: notification.message,
          type: notification.type,
          receivers: updatedReceivers,
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

  getSubscribersFor(
    type: NotificationType,
    bookId?: number
  ): Observable<string[]> {
    var result = new Subject<string[]>();
    this.userService.getUsers().subscribe((users) => {
      const subscribers: string[] = users
        .filter(
          (user) =>
            user.subscribedFor.includes(type) &&
            (bookId ? user.subscribedForBookIds.includes(bookId) : true)
        )
        .map((user) => user.uuid);
      result.next(subscribers);
    });
    return result.asObservable();
  }

  mapToReceivers(uuids: string[]): NotificationReceiver[] {
    return uuids.map((uuid) => ({ uuid, read: false }));
  }
}
