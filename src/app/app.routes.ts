import { Routes } from '@angular/router';
import { AddBookComponent } from './books/add-book/add-book.component';
import { BooksListComponent } from './books/books-list/books-list.component';
import { BookDetailsComponent } from './books/book-details/book-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  {
    path: 'books',
    children: [
      { path: '', component: BooksListComponent },
      { path: 'add', component: AddBookComponent },
      {
        path: ':bookId',
        component: BookDetailsComponent,
      },
    ],
  },
];
