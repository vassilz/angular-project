import { Routes } from '@angular/router';
import { AddBookComponent } from './books/add-book/add-book.component';
import { BooksListComponent } from './books/books-list/books-list.component';
import { BookDetailsComponent } from './books/book-details/book-details.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './users/register/register.component';
import { LoginComponent } from './users/login/login.component';
import { ProfileComponent } from './users/profile/profile.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { EditBookComponent } from './books/edit-book/edit-book.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile/:uuid', component: ProfileComponent },
  {
    path: 'books',
    children: [
      { path: '', component: BooksListComponent },
      { path: 'add', component: AddBookComponent },
      {
        path: ':bookId',
        component: BookDetailsComponent,
      },
      {
        path: ':bookId/edit',
        component: EditBookComponent,
      },
    ],
  },
  { path: 'error', component: ErrorMessageComponent },
];
