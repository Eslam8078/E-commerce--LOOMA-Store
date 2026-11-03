import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProduct } from '../models/product.model';

const STORAGE_KEY = 'looma_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly itemsSubject = new BehaviorSubject<IProduct[]>(this.readStorage());
  readonly items$ = this.itemsSubject.asObservable();

  get items(): IProduct[] {
    return this.itemsSubject.value;
  }

  get count(): number {
    return this.items.length;
  }

  contains(productId: string): boolean {
    return this.items.some((item) => item._id === productId);
  }

  toggle(product: IProduct): boolean {
    const exists = this.contains(product._id);
    const next = exists
      ? this.items.filter((item) => item._id !== product._id)
      : [product, ...this.items];
    this.persist(next);
    return !exists;
  }

  remove(productId: string): void {
    this.persist(this.items.filter((item) => item._id !== productId));
  }

  clear(): void {
    this.persist([]);
  }

  private readStorage(): IProduct[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(items: IProduct[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
    this.itemsSubject.next(items);
  }
}
