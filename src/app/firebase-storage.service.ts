import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseStorageService {
  constructor() {
    const app = getApp(); // Ensure the app is initialized

    // Initialize Cloud Storage and get a reference to the service
    const storage = getStorage(app);
  }

  uploadFile(file: File): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${file.name}`);

    // Create file metadata including the content type
    const metadata = {
      contentType: 'image/jpeg',
    };

    return uploadBytes(storageRef, file, metadata).then((snapshot) => {
      console.log('Uploaded a blob or file!');
      return getDownloadURL(snapshot.ref);
    });
  }

  downloadFile(fileName: string): Promise<string> {
    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${fileName}`);

    return getDownloadURL(storageRef);
  }
}
