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
import { NotificationType } from '../../header/notifications/notifications';

@Component({
  selector: 'app-profile',
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
        this.subscribeNewBooks = user!.subscribedFor.includes('create-book');
        this.subscribeEditBooks = user!.subscribedFor.includes('update-book');
        this.subscribeDeleteBooks = user!.subscribedFor.includes('delete-book');
        this.subscribeNewAuthors =
          user!.subscribedFor.includes('create-author');
        this.subscribeNewReviews =
          user!.subscribedFor.includes('create-review');
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

    this.userService
      .getSubscribedBooksForUser(uuid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (book) => {
          this.subscribedBooks.push(book);
        },
        error: (err) => {
          console.error('Error fetching subscribed books:', err);
        },
        complete: () => {
          const authorObservables = this.subscribedBooks.map((book) =>
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

  subscribeNewBooks: boolean = true;
  subscribeEditBooks: boolean = true;
  subscribeDeleteBooks: boolean = true;
  subscribeNewAuthors: boolean = true;
  subscribeNewReviews: boolean = true;

  favoriteBooks: Book[] = [];
  subscribedBooks: Book[] = [];

  editProfile(form: NgForm) {
    if (form.invalid) {
      console.warn('Invalid profile form!');
      return;
    }

    console.log('Profile form value:', form.value);

    const {
      firstName,
      lastName,
      pageSize,
      subscribeNewBooks,
      subscribeEditBooks,
      subscribeDeleteBooks,
      subscribeNewAuthors,
      subscribeNewReviews,
    } = form.value;

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
        this.mapSubscriptions(
          subscribeNewBooks,
          subscribeEditBooks,
          subscribeDeleteBooks,
          subscribeNewAuthors,
          subscribeNewReviews
        ),
        this.user!.subscribedForBookIds,
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

  mapSubscriptions(
    subscribeNewBooks: any,
    subscribeEditBooks: any,
    subscribeDeleteBooks: any,
    subscribeNewAuthors: any,
    subscribeNewReviews: any
  ): NotificationType[] {
    const subscriptions: NotificationType[] = [];
    if (subscribeNewBooks) subscriptions.push('create-book');
    if (subscribeEditBooks) subscriptions.push('update-book');
    if (subscribeDeleteBooks) subscriptions.push('delete-book');
    if (subscribeNewAuthors) subscriptions.push('create-author');
    if (subscribeNewReviews) subscriptions.push('create-review');
    return subscriptions;
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }
}
