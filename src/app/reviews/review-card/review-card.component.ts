import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Review } from '../../types/review';
import { RouterLink } from '@angular/router';
import { User } from '../../types/user';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { ElapsedTimePipe } from '../../shared/pipes/elapsed-time.pipe';
import { Subject, Subscription } from 'rxjs';
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
export class ReviewCardComponent implements OnInit, OnDestroy {
  @Input()
  bookId: number = 0;

  @Input()
  review: Review = {} as Review;

  likesCount: number = 0;
  isLikedByCurrentUser: boolean = false;

  user: User = {} as User;

  subscription: Subscription | null = null;

  constructor(
    private userService: FirebaseUserService,
    // private userService: JettyUserService,
    private reviewService: FirebaseReviewService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.subscription = this.userService
      .getUserById(this.review.userid)
      .subscribe((user) => {
        this.user = user!;
      });

    this.reviewService
      .getLikesCountForReview(this.bookId, this.review.id)
      .subscribe((count) => {
        this.likesCount = count;
      });

    const isLikedLoaded = new Subject<void>();
    isLikedLoaded.subscribe(() => {});

    this.authenticationService.user$.subscribe((user) => {
      if (!!user) {
        this.reviewService
          .isReviewLikedByUser(this.bookId, this.review.id, user.uid)
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
        this.bookId,
        this.review.id,
        this.authenticationService.user!.uid
      )
      .subscribe(() => {
        this.isLikedByCurrentUser = true;
        this.likesCount++;
      });
  }

  dislikeReview() {
    this.reviewService
      .dislikeReview(
        this.bookId,
        this.review.id,
        this.authenticationService.user!.uid
      )
      .subscribe(() => {
        this.isLikedByCurrentUser = false;
        this.likesCount--;
      });
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
  }
}
