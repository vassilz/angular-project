import { Book } from './book';
import { User } from './user';

export interface Review {
  book: Book;
  user: User;
  text: string;
  rating: number;
  reviewDate: string;
}
