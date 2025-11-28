import { Component, signal } from '@angular/core';
import { FirebaseUserService } from '../firebase-user.service';
import { User } from '../../types/user';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';
import { downloadFile, parseCsvToUsers } from '../../file.service';

@Component({
  selector: 'app-users-list',
  imports: [],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
  async onCsvUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
    const users = parseCsvToUsers(text);
    for (const user of users) {
      const uuid = crypto.randomUUID();
      const password = 'changeme';
      await new Promise<void>((resolve, reject) => {
        this.userService
          .createUser(
            uuid,
            user.username,
            user.email,
            user.firstName,
            user.lastName,
            password,
            [],
            { pageSize: 5 }
          )
          .subscribe({
            next: () => {
              this.toastService.add(
                $localize`User ${user.username} created successfully`
              );
              resolve();
            },
            error: (err) => {
              this.errorHandlingService.handleError(err);
              reject(err);
            },
          });
      });
    }
  }

  protected readonly users = signal<User[]>([]);
  constructor(
    private userService: FirebaseUserService,
    private toastService: ToastService,
    private errorHandlingService: ErrorHandlingService
  ) {
    userService
      .getUsers()
      .pipe(take(1))
      .subscribe((users) => {
        this.users.set(users);
      });
  }

  deleteUser(user: User) {
    this.userService
      .deleteUser(user.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.add(
            $localize`User ${user.username} deleted successfully`
          );
          this.users.update((currentUsers) =>
            currentUsers.filter((u) => u.id !== user.id)
          );
        },
        error: (err) => {
          this.errorHandlingService.handleError(err);
        },
      });
  }

  download() {
    let url = downloadFile(this.users(), 'users');
    let dwldLink = document.createElement('a');
    let isSafariBrowser =
      navigator.userAgent.indexOf('Safari') != -1 &&
      navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      // If Safari open in new window to
      // save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'users.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }
}
