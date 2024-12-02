import { Book } from './book';
import { Review } from './review';

export interface User {
  name: string;
  username: string;
  email: string;
  password: string;
  favoriteBooks: Book[];
  reviews: Review[];
}
