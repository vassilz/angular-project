import { Routes } from '@angular/router';
import { AddBookComponent } from './books/add-book/add-book.component';
import { BooksListComponent } from './books/books-list/books-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/books', pathMatch: 'full' },
  { path: 'books', component: BooksListComponent },
  { path: 'books/add', component: AddBookComponent },
];
