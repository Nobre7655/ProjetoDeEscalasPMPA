// src/app/core/services/anexos-db.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AnexosDbService {
  private readonly dbName = 'pmpa_anexos_db_v1';
  private readonly storeName = 'anexos';
  private dbPromise: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('IndexedDB não está disponível neste ambiente.'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);

      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    return this.dbPromise;
  }

  async put(id: string, blob: Blob): Promise<void> {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async get(id: string): Promise<Blob | null> {
    const db = await this.open();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const req = tx.objectStore(this.storeName).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async del(id: string): Promise<void> {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }
}
