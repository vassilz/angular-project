import { Component, OnInit } from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';
import { BookCardComponent } from '../book-card/book-card.component';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [RouterLink, BookCardComponent],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit {
  constructor(private bookService: FirebaseBookService) {}

  books: Book[] = [];

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => {
      console.log(data.val());
      this.books = data.val();
      this.books.forEach((book, index) => {
        book.id = index;
      });
    });
  }
}
