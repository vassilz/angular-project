import {
  Component,
  Input,
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

  hasUserReviewedBook: WritableSignal<boolean> = signal(false);

  constructor(
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['bookId'];

    this.bookSubscription = this.bookService.getBook(id).subscribe((data) => {
      this.book = data.val();
      this.book.id = id;
      this.isLoading = false;
    });

    this.userSubscription = this.authenticationService.user$.subscribe(
      (authenticatedUser) => {
        if (!!authenticatedUser) {
          this.reviewService
            .getReviewByBookAndUser(id, authenticatedUser.uid)
            .subscribe((review) => {
              this.hasUserReviewedBook.set(!!review);
            });
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.bookSubscription!.unsubscribe();
    this.userSubscription!.unsubscribe();
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  hasReviewedBook(): boolean {
    return this.hasUserReviewedBook();
  }
}
