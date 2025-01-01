import { Component, OnInit } from '@angular/core';
import { Book } from '../../../types/book';
import { RecentBookCardComponent } from '../recent-book-card/recent-book-card.component';
import { Subscription } from 'rxjs';
import { FirebaseBookService } from '../../firebase-book.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';

@Component({
  selector: 'app-recent-books-list',
  standalone: true,
  imports: [RecentBookCardComponent, LoaderComponent],
  templateUrl: './recent-books-list.component.html',
  styleUrl: './recent-books-list.component.css',
})
export class RecentBooksListComponent implements OnInit {
  recentBooks: Book[] = [];

  isLoading: boolean = true;

  subscription: Subscription | null = null;

  constructor(private bookService: FirebaseBookService) {}

  ngOnInit(): void {
    this.loadRecentBooks();
  }

  loadRecentBooks(count: number = 5) {
    this.isLoading = true;

    this.subscription = this.bookService
      .getRecentBooks(count)
      .subscribe((books) => {
        this.recentBooks = books || [];
        this.recentBooks.forEach((book, index) => {
          book.id = index;
        });
        this.isLoading = false;
      });
  }
}
