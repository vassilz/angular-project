import { Component, signal } from '@angular/core';
import { Book } from '../../../types/book';
import { RecentBookCardComponent } from '../recent-book-card/recent-book-card.component';
import { FirebaseBookService } from '../../firebase-book.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { JettyBookService } from '../../jetty-book.service';
import { take } from 'rxjs';
import moment from 'moment';
import 'moment/locale/bg';

@Component({
    selector: 'app-recent-books-list',
    imports: [RecentBookCardComponent, LoaderComponent],
    templateUrl: './recent-books-list.component.html',
    styleUrl: './recent-books-list.component.css'
})
export class RecentBooksListComponent {
  recentBooks = signal<Book[]>([]);

  isLoading = signal<boolean>(true);

  constructor(private bookService: FirebaseBookService) {
    moment.locale('bg'); // Set locale for moment.js

    this.loadRecentBooks();
  }

  loadRecentBooks(count: number = 5) {
    this.isLoading.set(true);

    this.bookService
      .getRecentBooks(count)
      .pipe(take(1))
      .subscribe((books) => {
        this.recentBooks.set(books || []);
        this.recentBooks().forEach((book, index) => {
          book.id = index;
        });
        this.isLoading.set(false);
      });
  }
}
