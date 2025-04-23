import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
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
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { RerenderService } from '../../rerender.service';
import { JettyBookService } from '../jetty-book.service';

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
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book = {} as Book;

  isLoading: boolean = true;

  bookSubscription: Subscription | null = null;
  userSubscription: Subscription | null = null;
  rerenderSubscription: Subscription | null = null;

  hasUserReviewedBook: WritableSignal<boolean> = signal(false);

  constructor(
    private route: ActivatedRoute,
    // private bookService: FirebaseBookService,
    private bookService: JettyBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private rerenderService: RerenderService,
    private changeDetection: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['bookId'];

    this.bookSubscription = this.bookService.getBook(id).subscribe((book) => {
      this.book = book!;
      this.isLoading = false;
    });

    this.loadHasUserReviewedBook(id);

    this.rerenderSubscription = this.rerenderService.rerenderReviews.subscribe(
      () => {
        this.loadHasUserReviewedBook(id);
        this.changeDetection.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.bookSubscription!.unsubscribe();
    this.userSubscription!.unsubscribe();
    this.rerenderSubscription!.unsubscribe();
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  hasReviewedBook(): boolean {
    return this.hasUserReviewedBook();
  }

  loadHasUserReviewedBook(bookId: number): void {
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.authenticationService.user$.subscribe(
      (authenticatedUser) => {
        if (!!authenticatedUser) {
          this.reviewService
            .getReviewByBookAndUser(bookId, authenticatedUser.uid)
            .subscribe((review) => {
              this.hasUserReviewedBook.set(!!review);
            });
        }
      }
    );
  }
}
