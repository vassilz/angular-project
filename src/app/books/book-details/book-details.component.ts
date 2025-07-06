import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { Book } from '../../types/book';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FirebaseBookService } from '../firebase-book.service';
import { AddReviewComponent } from '../../reviews/add-review/add-review.component';
import { ReviewsListComponent } from '../../reviews/reviews-list/reviews-list.component';
import { AuthenticationService } from '../../authentication.service';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { EditReviewComponent } from '../../reviews/edit-review/edit-review.component';
import { DatePipe } from '@angular/common';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { RerenderService } from '../../rerender.service';
import { JettyBookService } from '../jetty-book.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FirebaseAuthorService } from '../../authors/firebase-author.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    RouterLink,
    AddReviewComponent,
    ReviewsListComponent,
    EditReviewComponent,
    DatePipe,
    LoaderComponent,
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent implements OnInit {
  book = signal<Book>({} as Book);

  bookId: number = 0;

  authorName = signal<string>('');

  isLoading = signal<boolean>(true);

  hasUserReviewedBook: WritableSignal<boolean> = signal(false);

  constructor(
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    // private bookService: JettyBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private authorService: FirebaseAuthorService,
    private rerenderService: RerenderService,
    private changeDetection: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) {
    this.bookId = this.route.snapshot.params['bookId'];

    this.bookService
      .getBook(this.bookId)
      .pipe(takeUntilDestroyed())
      .subscribe((book) => {
        console.log('Book details:', book);
        this.book.set(book!);
        this.isLoading.set(false);

        this.loadAuthor();
      });
  }

  ngOnInit(): void {
    this.loadHasUserReviewedBook(this.bookId);

    this.rerenderService.rerenderReviews
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadHasUserReviewedBook(this.bookId);
        this.changeDetection.detectChanges();
      });
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  loadAuthor() {
    console.log('Loading author :', this.book().authorId);
    this.authorService
      .getAuthor(this.book().authorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((author) => {
        this.authorName.set(author?.name || 'Unknown Author');
      });
  }

  hasReviewedBook(): boolean {
    return this.hasUserReviewedBook();
  }

  loadHasUserReviewedBook(bookId: number): void {
    this.authenticationService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authenticatedUser) => {
        if (!!authenticatedUser) {
          this.reviewService
            .getReviewByBookAndUser(bookId, authenticatedUser.uid)
            .subscribe((review) => {
              this.hasUserReviewedBook.set(!!review);
            });
        }
      });
  }
}
