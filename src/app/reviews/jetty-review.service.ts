import { Injectable } from '@angular/core';
import { from, Observable, Subject } from 'rxjs';
import { Review } from '../types/review';
import { HttpClient } from '@angular/common/http';
import { ReviewService } from './review.service';

@Injectable({
  providedIn: 'root',
})
export class JettyReviewService implements ReviewService {
  constructor(private http: HttpClient) {}

  getReviews(bookId: number): Observable<Review[]> {
    const foundReviews = new Subject<Review[]>();
    const observable = this.http.get<Review[]>(`/api/books/${bookId}/reviews`);
    observable.subscribe((reviews) => {
      //   const reviews: Review[] = reviews.val() || [];

      reviews.forEach((review, index) => {
        review.id = index;
      });

      foundReviews.next(reviews);
    });

    return foundReviews.asObservable();
  }

  getReviewsWithText(bookId: number): Observable<Review[]> {
    throw new Error('Method not implemented.');
  }

  getReviewCount(bookId: number): Observable<number> {
    throw new Error('Method not implemented.');
  }

  getReviewById(bookId: number, reviewId: number): Observable<Review | null> {
    const observable = this.http.get<Review>(
      `/api/books/${bookId}/reviews/${reviewId}`
    );

    var foundReview = new Subject<Review | null>();
    observable.subscribe((review) => {
      //   const review: Review = review.val();
      if (!!review) {
        review.id = reviewId;
      }

      foundReview.next(review);
    });

    return foundReview.asObservable();
  }

  getReviewByBookAndUser(
    bookId: number,
    userId: string
  ): Observable<Review | null> {
    const observable = this.http.get<Review[]>(`/api/books/${bookId}/reviews`);

    var foundReview = new Subject<Review | null>();
    observable.subscribe((reviews) => {
      //   const reviews: Review[] = reviews.val();

      if (!!reviews) {
        reviews.forEach((review, index) => {
          review.id = index;
        });

        const review = reviews.filter((review) => review.userid === userId)[0];

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
    this.http
      .post<Review>(`/api/books/${bookId}/reviews/${reviewId}`, {
        rating,
        text,
        userid,
        reviewDate,
        likedBy: [],
      })
      .subscribe(() => {
        result.next();
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
    likedBy: string[]
  ): Observable<void> {
    var result = new Subject<void>();
    this.http
      .put<Review>(`/api/books/${bookId}/reviews/${reviewId}`, {
        rating,
        text,
        userid,
        reviewDate,
        likedBy,
      })
      .subscribe(() => {
        result.next();
      });
    return result.asObservable();
  }

  deleteReview(bookId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`/api/books/${bookId}/reviews/${reviewId}`);
  }

  getLikesCountForReview(bookId: number, reviewId: number): Observable<number> {
    const observable = this.http.get<Review>(
      `/api/books/${bookId}/reviews/${reviewId}`
    );

    var likesCount = new Subject<number>();
    const subscription = observable.subscribe((review) => {
      //   const review: Review = review.val();

      if (!!review) {
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
    const observable = this.http.get<Review>(
      `/api/books/${bookId}/reviews/${reviewId}`
    );

    var isLiked = new Subject<boolean>();
    const subscription = observable.subscribe((review) => {
      //   const review: Review = review.val();

      if (!!review) {
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
      if (review?.likedBy.includes(userId)) {
        // Nothing to do
        result.next();
      } else {
        // from(
        //   update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
        //     likedBy: [...review.likedBy, userId],
        //   })
        // ).subscribe(() => {
        //   result.next();
        // });
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
      if (!review?.likedBy.includes(userId)) {
        // Nothing to do
        result.next();
      } else {
        // from(
        //   update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
        //     likedBy: review.likedBy.filter((id) => id !== userId),
        //   })
        // ).subscribe(() => {
        //   result.next();
        // });
      }
    });

    return result.asObservable();
  }
}
