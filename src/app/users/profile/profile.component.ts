import { Component, DestroyRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FirebaseUserService } from '../firebase-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../types/user';
import { Book } from '../../types/book';
import { AuthenticationService } from '../../authentication.service';
import { JettyUserService } from '../jetty-user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';
import { forkJoin, map, take } from 'rxjs';
import { ToastService } from '../../toast/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  bookAuthors: Map<number, string> = new Map();

  constructor(
    private userService: FirebaseUserService,
    // private userService: JettyUserService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private authorService: FirebaseAuthorService,
    private destroyRef: DestroyRef,
    private toastService: ToastService
  ) {
    const uuid = this.authenticationService.user!.uid;

    this.userService
      .getUserById(uuid)
      .pipe(take(1))
      .subscribe((user) => {
        this.user = user;
        this.firstName = user!.firstName;
        this.lastName = user!.lastName;
        this.pageSize = user!.settings.pageSize;
      });

    this.userService
      .getFavoriteBooksForUser(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (book) => {
          this.favoriteBooks.push(book);
        },
        error: (err) => {
          console.error('Error fetching favorite books:', err);
        },
        complete: () => {
          const authorObservables = this.favoriteBooks.map((book) =>
            this.authorService.getAuthor(book.authorId).pipe(
              map((author) => {
                this.bookAuthors.set(book.id, author!.name);
              })
            )
          );

          forkJoin(authorObservables)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {});
        },
      });
  }

  user: User | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  pageSize: number = 5;

  favoriteBooks: Book[] = [];

  editProfile(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid profile form!');
      return;
    }

    const { firstName, lastName, pageSize } = form.value;

    this.userService
      .updateUser(
        this.user!.id,
        this.user!.username,
        this.user!.uuid,
        this.user!.email,
        firstName,
        lastName,
        this.user!.password,
        this.user!.favoriteBookIds,
        { pageSize }
      )
      .pipe(take(1))
      .subscribe((data) => {
        console.info('User updated successfully');
        this.toastService.add(
          $localize`User profile updated successfully for user: ${
            this.user!.username
          }`
        );
        this.router.navigate(['/home']);
      });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }
}
