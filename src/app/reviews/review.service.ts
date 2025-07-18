import { Observable } from 'rxjs';
import { Review } from '../types/review';

export interface ReviewService {
  getReviews(bookId: number): Observable<Review[]>;

  getReviewsWithText(bookId: number): Observable<Review[]>;

  getReviewCount(bookId: number): Observable<number>;

  getReviewById(bookId: number, reviewId: number): Observable<Review | null>;

  getReviewByBookAndUser(
    bookId: number,
    userId: string
  ): Observable<Review | null>;

  createReview(
    bookId: number,
    reviewId: number,
    userid: string,
    rating: number,
    text: string,
    reviewDate: string
  ): Observable<void>;

  updateReview(
    bookId: number,
    reviewId: number,
    userid: string,
    rating: number,
    text: string,
    reviewDate: string,
    likedBy: string[]
  ): Observable<void>;

  deleteReview(bookId: number, reviewId: number): Observable<void>;

  getLikesCountForReview(bookId: number, reviewId: number): Observable<number>;

  isReviewLikedByUser(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<boolean>;

  likeReview(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<void>;

  dislikeReview(
    bookId: number,
    reviewId: number,
    userId: string
  ): Observable<void>;
}
