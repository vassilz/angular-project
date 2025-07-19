import { Component, effect, input, OnInit, signal } from '@angular/core';
import { Review } from '../../types/review';
import { RouterLink } from '@angular/router';
import { User } from '../../types/user';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { ElapsedTimePipe } from '../../shared/pipes/elapsed-time.pipe';
import { Subject, take } from 'rxjs';
import { FirebaseReviewService } from '../firebase-review.service';
import { AuthenticationService } from '../../authentication.service';
import { JettyUserService } from '../../users/jetty-user.service';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [RouterLink, ElapsedTimePipe],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css',
})
export class ReviewCardComponent implements OnInit {
  bookId = input.required<number>();

  review = input.required<Review>();

  likesCount = signal<number>(0);
  isLikedByCurrentUser: boolean = false;

  user = signal<User>({} as User);

  constructor(
    private userService: FirebaseUserService,
    // private userService: JettyUserService,
    private reviewService: FirebaseReviewService,
    protected authenticationService: AuthenticationService
  ) {
    effect(() => {
      console.log('Logged in: ', this.authenticationService.isLoggedIn);
      console.log('Logged in user:', this.authenticationService.user?.uid);
      console.log('Review user:', this.review().userid);
    });
  }

  ngOnInit(): void {
    this.userService
      .getUserById(this.review().userid)
      .pipe(take(1))
      .subscribe((user) => {
        this.user.set(user!);
      });

    this.reviewService
      .getLikesCountForReview(this.bookId(), this.review().id)
      .pipe(take(1))
      .subscribe((count) => {
        this.likesCount.set(count);
      });

    const isLikedLoaded = new Subject<void>();
    isLikedLoaded.subscribe(() => {});

    this.authenticationService.user$.subscribe((user) => {
      if (!!user) {
        this.reviewService
          .isReviewLikedByUser(this.bookId(), this.review().id, user.uid)
          .pipe(take(1))
          .subscribe((isLiked) => {
            this.isLikedByCurrentUser = isLiked;
            isLikedLoaded.next();
          });
      } else {
        isLikedLoaded.next();
      }
    });
  }

  get isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  likeReview() {
    this.reviewService
      .likeReview(
        this.bookId(),
        this.review().id,
        this.authenticationService.user!.uid
      )
      .pipe(take(1))
      .subscribe(() => {
        this.isLikedByCurrentUser = true;
        this.likesCount.set(this.likesCount() + 1);
      });
  }

  dislikeReview() {
    this.reviewService
      .dislikeReview(
        this.bookId(),
        this.review().id,
        this.authenticationService.user!.uid
      )
      .pipe(take(1))
      .subscribe(() => {
        this.isLikedByCurrentUser = false;
        this.likesCount.set(this.likesCount() - 1);
      });
  }
}
