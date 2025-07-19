import { Component, signal } from '@angular/core';
import { FirebaseUserService } from '../firebase-user.service';
import { User } from '../../types/user';
import { ToastService } from '../../toast/toast.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.css',
})
export class UsersListComponent {
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
          this.toastService.add(`User ${user.username} deleted successfully`);
          this.users.update((currentUsers) =>
            currentUsers.filter((u) => u.id !== user.id)
          );
        },
        error: (err) => {
          this.errorHandlingService.handleError(err);
        },
      });
  }
}
