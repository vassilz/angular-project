import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';
import { Review } from '../../types/review';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { AverageRatingPipe } from '../../reviews/average-rating.pipe';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { RerenderService } from '../../rerender.service';
import { HighlightSearchPipe } from '../../highlight-search.pipe';
import { FirebaseBookService } from '../firebase-book.service';
import { ErrorHandlingService } from '../../errors/error-handling.service';
import { JettyBookService } from '../jetty-book.service';
import { JettyUserService } from '../../users/jetty-user.service';
import { ToastService } from '../../toast/toast.service';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-book-card',
    imports: [RouterLink, AverageRatingPipe, HighlightSearchPipe],
    templateUrl: './book-card.component.html',
    styleUrl: './book-card.component.css'
})
export class BookCardComponent implements OnInit {
  book = input.required<Book>();

  searchTerm = input<string>('');

  favoriteBookIds = input.required<number[]>();

  confirmDeletionDialog = viewChild.required('confirmDeletionDialog', {
    read: ElementRef,
  });

  reviews = signal<Review[]>([]);

  authorName = signal<string>('');

  isFavorite: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private userService: FirebaseUserService,
    // private userService: JettyUserService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService,
    private bookService: FirebaseBookService,
    // private bookService: JettyBookService,
    private authorService: FirebaseAuthorService,
    private errorHandlingService: ErrorHandlingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // console.log('Book card component initialized for book: ' + this.book.id);
    // console.log(this.book);
    this.loadAuthor();

    this.loadReviews();
    this.loadIsFavorite();

    this.rerenderService.rerenderReviews.subscribe(() => {
      // console.log(
      //   'Book card component re-initialized for book: ' + this.book.id
      // );
      // console.log(this.book);

      this.loadReviews();
      // this.loadIsFavorite();
      this.changeDetectorRef.detectChanges();
    });
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }

  loadAuthor() {
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(take(1))
      .subscribe((author) => {
        this.authorName.set(author?.name || $localize`Unknown Author`);
      });
  }

  loadReviews() {
    this.reviewService
      .getReviews(this.book().id)
      .pipe(take(1))
      .subscribe((reviews) => {
        this.reviews.set(reviews);
      });
  }

  loadIsFavorite() {
    // this.userService
    //   .getFavoriteBookIdsForUser(this.authenticationService.user?.uid || '')
    //   .pipe(take(1))
    //   .subscribe((bookIds) => {
    //     const favoriteBookIds = bookIds || [];
    //     this.isFavorite = favoriteBookIds.includes(this.book().id);
    //     // console.log('Favorite book ids: ' + favoriteBookIds);
    //   });

    this.isFavorite = this.favoriteBookIds().includes(this.book().id);
  }

  toggleFavorite() {
    if (this.isFavorite) {
      this.userService
        .removeFavoriteBookForUser(
          this.authenticationService.user!.uid,
          this.book().id
        )
        .pipe(take(1))
        .subscribe(() => {
          this.isFavorite = false;
          this.toastService.add(
            $localize`Book ${this.book().name} removed from favorites`
          );
        });
    } else {
      this.userService
        .addFavoriteBookForUser(
          this.authenticationService.user!.uid,
          this.book().id
        )
        .pipe(take(1))
        .subscribe(() => {
          this.isFavorite = true;
          this.toastService.add(
            $localize`Book ${this.book().name} added to favorites`
          );
        });
    }
  }

  onDelete() {
    this.confirmDeletionDialog().nativeElement.showModal();
  }

  deleteBook() {
    this.bookService
      .deleteBook(this.book().id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          console.log('Cleaning up favorite book for users');
          this.userService
            .cleanupFavoriteBook(this.book().id)
            .pipe(take(1))
            .subscribe(() => {
              this.rerenderService.rerenderBooks.emit();
              this.toastService.add(
                $localize`Book ${this.book().name} deleted successfully`
              );

              this.confirmDeletionDialog().nativeElement.close();
            });
        },
        // TODO handle errors with an interceptor
        error: (err) => {
          this.errorHandlingService.handleError(err);
        },
      });
  }
}
