import { Component, OnInit } from '@angular/core';
import { FirebaseBookService } from '../firebase-book.service';
import { Book } from '../../types/book';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-books-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './books-list.component.html',
  styleUrl: './books-list.component.css',
})
export class BooksListComponent implements OnInit {
  constructor(private bookService: FirebaseBookService) {}

  books: Book[] = [];

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((data) => (this.books = data.val()));
  }
}
