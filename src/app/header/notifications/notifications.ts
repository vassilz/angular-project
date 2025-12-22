export type Notification = {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
  receivers: NotificationReceiver[];
};

export type NotificationReceiver = {
  uuid: string;
  // notificationId: number;
  read: boolean;
};

export type NotificationType =
  | 'create-book'
  | 'update-book'
  | 'delete-book'
  | 'create-author'
  | 'create-review';

export const defaultSubscriptions: NotificationType[] = [
  'create-book',
  'create-author',
];
