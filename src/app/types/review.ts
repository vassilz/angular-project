import { Book } from './book';
import { User } from './user';

export interface Review {
  id: number;
  book: Book;
  userid: string;
  text: string;
  rating: number;
  reviewDate: string;
}
