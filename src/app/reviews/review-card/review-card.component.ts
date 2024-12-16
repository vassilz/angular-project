import { Component, Input } from '@angular/core';
import { Review } from '../../types/review';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css',
})
export class ReviewCardComponent {
  @Input()
  review: Review = {} as Review;
}
