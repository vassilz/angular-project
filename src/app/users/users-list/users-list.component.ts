import { Component, DestroyRef, signal } from '@angular/core';
import { FirebaseUserService } from '../firebase-user.service';
import { User } from '../../types/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../toast/toast.service';

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
    private destroyRef: DestroyRef
  ) {
    userService
      .getUsers()
      .pipe(takeUntilDestroyed())
      .subscribe((users) => {
        this.users.set(users);
      });
  }

  deleteUser(id: number) {
    this.userService
      .deleteUser(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.toastService.add(`User ${id} deleted successfully`);
      });
  }
}
