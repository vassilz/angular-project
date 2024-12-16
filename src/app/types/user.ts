import { Book } from './book';
import { Review } from './review';

export interface User {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  favoriteBooks: Book[];
  reviews: Review[];
}
