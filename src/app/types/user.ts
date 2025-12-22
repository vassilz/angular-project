import { NotificationType } from '../header/notifications/notifications';
import { Book } from './book';
import { Review } from './review';
import { Settings } from './settings';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  uuid: string;
  password: string;
  favoriteBookIds: number[];
  subscribedFor: NotificationType[];
  subscribedForBookIds: number[];
  settings: Settings;
  // reviews: Review[];
}
