import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../authentication.service';
import { Router, RouterLink } from '@angular/router';
import { ErrorMessageService } from '../errors/error-message/error-message.service';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsPopupComponent } from './notifications/notifications-popup.component';
import { Notification } from './notifications/notifications';
import { NotificationsService } from './notifications/notifications.service';

export interface NotificationPopupData {
  uuid: string;

  notifications: Notification[];
}

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  uuid: string | null = null;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private errorMessageService: ErrorMessageService,
    private notificationsService: NotificationsService
  ) {
    this.authenticationService.user$.subscribe((loggedInUser) => {
      this.uuid = loggedInUser?.uid || null;
    });
  }

  logout() {
    const router = this.router;
    const errorMessageService = this.errorMessageService;

    this.authenticationService
      .logout()
      .pipe(take(1))
      .subscribe({
        next(value) {
          // Logout successful
          router.navigate(['/home']);
        },
        error(err) {
          console.error('Logout error' + err);

          errorMessageService.setError(err);
          router.navigate(['/error']);
        },
        // complete() {
        //   console.log('Subscription complete');
        // },
      });
  }
  isLoggedIn() {
    // console.log('Is logged in: ' + this.authenticationService.isLoggedIn);
    return this.authenticationService.isLoggedIn;
  }

  switchLanguage(language: string) {
    window.location.href = `/${language}/`;
  }

  readonly dialog = inject(MatDialog);

  openDialog(): void {
    const dialogRef = this.dialog.open(NotificationsPopupComponent, {
      data: {
        uuid: this.uuid,
        // notifications: this.notificationsService.notifications(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        // this.animal.set(result);
      }
    });
  }
}
