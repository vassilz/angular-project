import { Routes } from '@angular/router';
import { AddBookComponent } from './books/add-book/add-book.component';
import { BooksListComponent } from './books/books-list/books-list.component';
import { BookDetailsComponent } from './books/book-details/book-details.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
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
