import { Component, Input } from '@angular/core';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { AuthenticationService } from '../../authentication.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.css',
})
export class BookCardComponent {
  @Input()
  book: Book = {} as Book;

  constructor(private authenticationService: AuthenticationService) {}

  get isAdmin(): boolean {
    return this.authenticationService.user?.email === 'admin@gmail.com';
  }
}
