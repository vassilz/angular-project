import { Pipe, PipeTransform } from '@angular/core';
import { Review } from '../types/review';

@Pipe({
  name: 'averageRating',
  standalone: true,
})
export class AverageRatingPipe implements PipeTransform {
  transform(reviews: Review[], ...args: unknown[]): unknown {
    return (
      reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length || 0
    );
  }
}
