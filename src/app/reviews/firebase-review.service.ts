import { Injectable } from '@angular/core';
import {
  Database,
  DataSnapshot,
  get,
  objectVal,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { from, map, Observable, Subject } from 'rxjs';
import { Review } from '../types/review';
import { ReviewService } from './review.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseReviewService implements ReviewService {
  constructor(private db: Database) {}

  getReviews(bookId: number): Observable<Review[]> {
    const foundReviews = new Subject<Review[]>();
    const observable = from(get(ref(this.db, `books/${bookId}/reviews`)));
    observable.subscribe((data) => {
      const reviews: Review[] = data.val() || [];

      reviews.forEach((review, index) => {
        review.id = index;

        // Firebase does not store properties with empty arrays, so need to initialize it
        if (review.likedBy === undefined) {
          review.likedBy = [];
        }
      });

      foundReviews.next(reviews);
    });

    return foundReviews.asObservable();
  }

  getReviewsWithText(bookId: number): Observable<Review[]> {
    return this.getReviews(bookId).pipe(
      map((reviews: Review[]) =>
        reviews.filter((review: Review) => review.text.trim() !== '')
      )
    );
  }

  getReviewCount(bookId: number): Observable<number> {
    return this.getReviews(bookId).pipe(
      map((reviews: Review[]) => reviews.length)
    );
  }

  getReviewById(bookId: number, reviewId: number): Observable<Review | null> {
    const observable = from(
      get(ref(this.db, `books/${bookId}/reviews/${reviewId}`))
    );

    var foundReview = new Subject<Review | null>();
    observable.subscribe((data) => {
      const review: Review | null = data.val();
      if (!!review) {
        review.id = reviewId;
        if (review.likedBy === undefined) {
          review.likedBy = [];
        }
      }

      foundReview.next(review);
    });

    return foundReview.asObservable();
  }

  getReviewByBookAndUser(
    bookId: number,
    userId: string
  ): Observable<Review | null> {
    const observable = from(get(ref(this.db, `books/${bookId}/reviews`)));

    var foundReview = new Subject<Review | null>();
    observable.subscribe((data) => {
      const reviews: Review[] = data.val();

      if (!!reviews) {
        reviews.forEach((review, index) => {
          review.id = index;
        });

        const review = reviews.filter((review) => review.userid === userId)[0];
        if (review && review.likedBy === undefined) {
          review.likedBy = [];
        }

        foundReview.next(review);
      } else {
        foundReview.next(null);
      }
    });

    return foundReview.asObservable();
  }

  createReview(
    bookId: number,
    reviewId: number,
    userid: string,
    rating: number,
    text: string,
    reviewDate: string
  ): Observable<void> {
    var result = new Subject<void>();
    const observable = from(get(ref(this.db, `books/${bookId}/reviews`)));

    const subscription = observable.subscribe((data) => {
      const reviews: Review[] = data.val() || [];
      console.log('Reviews fetched for creation:', reviews);
      const firstFreeIndex = reviews.findIndex(
        (review) => review === undefined
      );
      console.log('First free index:', firstFreeIndex);
      const nextReviewId =
        firstFreeIndex === -1 ? reviews.length : firstFreeIndex;
      console.log('Next review ID:', nextReviewId);
      subscription.unsubscribe();

      from(
        set(ref(this.db, `books/${bookId}/reviews/${nextReviewId}`), {
          rating,
          text,
          userid,
          reviewDate,
          likedBy: [],
        })
      ).subscribe({
        next: () => {
          result.next();
        },
        error: (err) => {
          result.error(err);
          console.error('Error creating review:', err);
        },
      });
    });

    return result.asObservable();
  }

  updateReview(
    bookId: number,
    reviewId: number,
    userid: string,
    rating: number,
    text: string,
    reviewDate: string,
    likedBy: string[] = []
  ): Observable<void> {
    return from(
      update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
        rating,
        text,
        userid,
        reviewDate,
        likedBy,
      })
    );
  }

  deleteReview(bookId: number, reviewId: number): Observable<void> {
    return from(remove(ref(this.db, `books/${bookId}/reviews/${reviewId}`)));
  }

  getLikesCountForReview(bookId: number, reviewId: number): Observable<number> {
    const observable = from(
      get(ref(this.db, `books/${bookId}/reviews/${reviewId}`))
    );

    var likesCount = new Subject<number>();
    const subscription = observable.subscribe((data) => {
      const review: Review = data.val();

      if (!!review && review.likedBy) {
        likesCount.next(review.likedBy.length);
      } else {
        likesCount.next(0);
      }
      subscription.unsubscribe();
    });

    return likesCount.asObservable();
  }

  isReviewLikedByUser(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<boolean> {
    const observable = from(
      get(ref(this.db, `books/${bookId}/reviews/${reviewId}`))
    );

    var isLiked = new Subject<boolean>();
    const subscription = observable.subscribe((data) => {
      const review: Review = data.val();

      if (!!review && review.likedBy) {
        isLiked.next(review.likedBy.includes(userId));
      } else {
        isLiked.next(false);
      }
      subscription.unsubscribe();
    });

    return isLiked.asObservable();
  }

  likeReview(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<void> {
    const result = new Subject<void>();

    this.getReviewById(bookId, reviewId).subscribe((review) => {
      if (review!.likedBy && review!.likedBy.includes(userId)) {
        // Nothing to do
        result.next();
      } else {
        from(
          update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
            likedBy: [...(review!.likedBy ?? []), userId],
          })
        ).subscribe(() => {
          result.next();
        });
      }
    });

    return result.asObservable();
  }

  dislikeReview(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<void> {
    const result = new Subject<void>();
    this.getReviewById(bookId, reviewId).subscribe((review) => {
      if (review!.likedBy === undefined || !review!.likedBy.includes(userId)) {
        // Nothing to do
        result.next();
      } else {
        from(
          update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
            likedBy: review!.likedBy.filter((id) => id !== userId),
          })
        ).subscribe(() => {
          result.next();
        });
      }
    });

    return result.asObservable();
  }
}
