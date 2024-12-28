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
import { FirebaseUserService } from '../../users/firebase-user.service';
import { Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    RouterLink,
    AddReviewComponent,
    ReviewsListComponent,
    EditReviewComponent,
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.css',
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book = {} as Book;

  bookSubscription: Subscription | null = null;
  userSubscription: Subscription | null = null;

  hasUserReviewedBook: WritableSignal<boolean> = signal(false);

  constructor(
    private route: ActivatedRoute,
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService,
    private reviewService: FirebaseReviewService,
    private userService: FirebaseUserService
  ) {}

  ngOnInit(): void {
    console.log('Book details init');

    const id = this.route.snapshot.params['bookId'];

    this.bookSubscription = this.bookService.getBook(id).subscribe((data) => {
      this.book = data.val();
      this.book.id = id;
    });

    this.userSubscription = this.authenticationService.user$.subscribe(
      (authenticatedUser) => {
        if (!!authenticatedUser) {
          console.log('Book details');
          console.log(authenticatedUser);

          this.reviewService
            .getReviewByBookAndUser(id, authenticatedUser.uid)
            .subscribe((review) => {
              console.log('Found review');
              console.log(review);

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
