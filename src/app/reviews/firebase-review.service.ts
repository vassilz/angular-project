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
import { from, Observable, Subject } from 'rxjs';
import { Review } from '../types/review';

@Injectable({
  providedIn: 'root',
})
export class FirebaseReviewService {
  constructor(private db: Database) {}

  getReviews(bookId: number): Observable<DataSnapshot> {
    return from(get(ref(this.db, `books/${bookId}/reviews`)));
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
    text: string
  ): Observable<void> {
    return from(
      set(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
        rating,
        text,
        userid,
      })
    );
  }

  updateReview(
    bookId: number,
    reviewId: number,
    username: string,
    rating: number,
    text: string
  ): Observable<void> {
    return from(
      update(ref(this.db, `books/${bookId}/reviews/${reviewId}`), {
        rating,
        text,
      })
    );
  }

  deleteReview(bookId: number, reviewId: number): Observable<void> {
    return from(remove(ref(this.db, `books/${bookId}/reviews/${reviewId}`)));
  }
}
