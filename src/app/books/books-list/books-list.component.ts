import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { BookCardComponent } from '../book-card/book-card.component';
import { AuthenticationService } from '../../authentication.service';
import { Subscription } from 'rxjs';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [RouterLink, BookCardComponent, LoaderComponent],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;

  isLoading: boolean = true;

  constructor(
    private bookService: FirebaseBookService,
    private authenticationService: AuthenticationService
  ) {}

  books: Book[] = [];

  ngOnInit(): void {
    this.subscription = this.bookService.getBooks().subscribe((data) => {
      this.books = data.val();
      this.books.forEach((book, index) => {
        book.id = index;
      });
      this.isLoading = false;
    });
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn;
  }

  ngOnDestroy(): void {
    this.subscription!.unsubscribe();
  }
}
