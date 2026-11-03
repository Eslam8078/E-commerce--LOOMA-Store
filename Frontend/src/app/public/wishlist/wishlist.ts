import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IProduct } from '../../core/models/product.model';
import { WishlistService } from '../../core/services/wishlist.service';
import { environment } from '../../../environment/env';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  products: IProduct[] = [];
  readonly staticURL = environment.staticURL;

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    this.products = this.wishlistService.items;
    this.wishlistService.items$.subscribe((items) => (this.products = items));
  }

  image(images: string[] | undefined): string {
    if (!images?.length) return '';
    return /^https?:\/\//i.test(images[0]) ? images[0] : `${this.staticURL}${images[0]}`;
  }

  remove(product: IProduct): void {
    this.wishlistService.remove(product._id);
  }
}
