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
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirebaseReviewService {
  constructor(private db: Database) {}

  getReviews(bookId: number): Observable<DataSnapshot> {
    return from(get(ref(this.db, `books/${bookId}/reviews`)));
  }

  createReview(
    bookId: number,
    reviewId: number,
    username: string,
    rating: number,
    text: string
  ): Observable<void> {
    return from(
      set(ref(this.db, `books/${bookId}/reviews/${reviewId}`), { rating, text })
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
