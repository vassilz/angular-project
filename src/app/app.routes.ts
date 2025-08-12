import { Routes } from '@angular/router';
import { AddBookComponent } from './books/add-book/add-book.component';
import { BooksListComponent } from './books/books-list/books-list.component';
import { BookDetailsComponent } from './books/book-details/book-details.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './users/register/register.component';
import { LoginComponent } from './users/login/login.component';
import { ProfileComponent } from './users/profile/profile.component';
import { ErrorMessageComponent } from './errors/error-message/error-message.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AdminGuard } from './admin.guard';
import { AuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { AuthorsListComponent } from './authors/authors-list/authors-list.component';
import { AuthorDetailsComponent } from './authors/author-details/author-details.component';
import { UnauthenticatedGuard } from './unauthenticated.guard';
import { bookResolver } from './books/book.resolver';
import { authorResolver } from './authors/author.resolver';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [UnauthenticatedGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [UnauthenticatedGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'books',
    children: [
      { path: '', component: BooksListComponent },
      {
        path: 'add',
        component: AddBookComponent,
        canActivate: [AuthGuard, AdminGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
      {
        path: ':bookId',
        component: BookDetailsComponent,
        resolve: { book: bookResolver },
      },
      {
        path: ':bookId/edit',
        loadComponent: () =>
          import('./books/edit-book/edit-book.component').then(
            (m) => m.EditBookComponent
          ),
        canActivate: [AuthGuard, AdminGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        resolve: { book: bookResolver },
      },
    ],
  },
  {
    path: 'authors',
    children: [
      { path: '', component: AuthorsListComponent },
      {
        path: 'add',
        loadComponent: () =>
          import('./authors/add-author/add-author.component').then(
            (m) => m.AddAuthorComponent
          ),
        canActivate: [AuthGuard, AdminGuard],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
      },
      {
        path: ':authorId',
        component: AuthorDetailsComponent,
        resolve: { author: authorResolver },
      },
    ],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users-list/users-list.component').then(
        (m) => m.UsersListComponent
      ),
    canActivate: [AuthGuard, AdminGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  { path: 'error', component: ErrorMessageComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/404' },
];
