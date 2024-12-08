import { Injectable } from '@angular/core';
import {
  Database,
  DataSnapshot,
  get,
  objectVal,
  ref,
  remove,
  set,
  update,
} from '@angular/fire/database';
import { from, Observable } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root',
})
export class FirebaseUserService {
  constructor(private db: Database) {}

  getUsers(): Observable<DataSnapshot> {
    return from(get(ref(this.db, 'user')));
  }

  createUser(userId: string, username: string, name: string): Observable<void> {
    return from(set(ref(this.db, 'users/' + userId), { username, name }));
  }

  updateUser(userId: string, username: string, name: string): Observable<void> {
    return from(update(ref(this.db, 'users/' + userId), { username, name }));
  }

  deleteUser(userId: string): Observable<void> {
    return from(remove(ref(this.db, 'users/' + userId)));
  }

  doStuff() {
    const doc = ref(this.db, 'user');
    console.log(doc);
    objectVal(doc).subscribe((data: any) => console.log(data));
  }
}
