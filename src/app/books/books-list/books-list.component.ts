import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { BookCardComponent } from '../book-card/book-card.component';
import { AuthenticationService } from '../../authentication.service';
import { forkJoin, map, Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { FormsModule } from '@angular/forms';
import { FirebaseReviewService } from '../../reviews/firebase-review.service';
import { UtilsService } from '../../shared/utils.service';

import moment from 'moment';
import { RerenderService } from '../../rerender.service';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [RouterLink, BookCardComponent, LoaderComponent, FormsModule],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;

  isLoading: boolean = true;

  sortBy: string = 'name';
  sortByOptions: string[] = [
    'name',
    'author',
    'publishDate',
    'pages',
    'rating',
  ];

  isDescending: boolean = false;

  SORT_BY_KEY: string = 'sortBy';
  IS_DESCENDING_KEY: string = 'isDescending';

  private comparatorFunctions: Map<string, (a: Book, b: Book) => number> =
    new Map([
      [
        'name',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.name.localeCompare(bookA.name)
            : bookA.name.localeCompare(bookB.name),
      ],
      [
        'author',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.author.localeCompare(bookA.author)
            : bookA.author.localeCompare(bookB.author),
      ],
      [
        'publishDate',
        (bookA, bookB) =>
          this.isDescending
            ? this.compareDates(bookB.publishDate, bookA.publishDate)
            : this.compareDates(bookA.publishDate, bookB.publishDate),
      ],
      [
        'pages',
        (bookA, bookB) =>
          this.isDescending
            ? bookB.pagesCount < bookA.pagesCount
              ? -1
              : 1
            : bookA.pagesCount < bookB.pagesCount
            ? -1
            : 1,
      ],
      [
        'rating',
        (bookA, bookB) =>
          this.isDescending
            ? this.compareRatings(bookB, bookA)
            : this.compareRatings(bookA, bookB),
      ],
    ]);

  constructor(
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private utilsService: UtilsService,
    private changeDetectorRef: ChangeDetectorRef,
    private rerenderService: RerenderService
  ) {}

  books: WritableSignal<Book[]> = signal<Book[]>([]);

  bookRatings: Map<number, number> = new Map();

  ngOnInit(): void {
    this.subscription = this.bookService.getBooks().subscribe((data) => {
      this.books.set(data.val() || []);
      this.books().forEach((book, index) => {
        book.id = index;
      });

      const reviewObservables = this.books().map((book) =>
        this.reviewService.getReviews(book.id).pipe(
          map((data) => {
            const reviews = data.val() || [];
            const rating = this.utilsService.calculateAverageRating(reviews);
            this.bookRatings.set(book.id, rating);
          })
        )
      );

      forkJoin(reviewObservables).subscribe(() => {
        console.log('All reviews have been processed.');

        if (!!localStorage.getItem(this.SORT_BY_KEY)) {
          this.sortBy = localStorage.getItem(this.SORT_BY_KEY)!;
        }

        if (!!localStorage.getItem(this.IS_DESCENDING_KEY)) {
          this.isDescending =
            localStorage.getItem(this.IS_DESCENDING_KEY) === 'true';
        }

        // Initial sort
        this.sortBooks();

        this.isLoading = false;
      });
    });
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  sortBooks() {
    localStorage.setItem(this.SORT_BY_KEY, this.sortBy);
    localStorage.setItem(this.IS_DESCENDING_KEY, this.isDescending.toString());

    this.books.set(
      this.books().sort(this.comparatorFunctions.get(this.sortBy))
    );
    this.changeDetectorRef.detectChanges();
    this.rerenderService.rerenderReviews.emit();
  }

  compareDates(dateA: string, dateB: string) {
    return moment(dateA).isBefore(dateB) ? -1 : 1;
  }

  compareRatings(bookA: Book, bookB: Book) {
    return this.bookRatings.get(bookA.id)! < this.bookRatings.get(bookB.id)!
      ? -1
      : 1;
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
  }
}
