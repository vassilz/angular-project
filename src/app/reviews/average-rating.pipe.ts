import { Pipe, PipeTransform } from '@angular/core';
import { Review } from '../types/review';
import { UtilsService } from '../shared/utils.service';

@Pipe({
  name: 'averageRating',
  standalone: true,
})
export class AverageRatingPipe implements PipeTransform {
  constructor(private utilsService: UtilsService) {}

  transform(reviews: Review[]): number {
    return this.utilsService.calculateAverageRating(reviews);
  }
}
