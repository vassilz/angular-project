import { Injectable } from '@angular/core';
import { Review } from '../types/review';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  calculateAverageRating(reviews: Review[]): number {
    return (
      reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length || 0
    );
  }
}
