import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../types/review';
import { RouterLink } from '@angular/router';
import { User } from '../../types/user';
import { FirebaseUserService } from '../../users/firebase-user.service';
import { ElapsedTimePipe } from '../../shared/pipes/elapsed-time.pipe';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [RouterLink, ElapsedTimePipe],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.css',
})
export class ReviewCardComponent implements OnInit {
  @Input()
  review: Review = {} as Review;

  user: User = {} as User;

  constructor(private userService: FirebaseUserService) {}

  ngOnInit(): void {
    this.userService.getUserById(this.review.userid).subscribe((user) => {
      this.user = user;
    });
  }
}
