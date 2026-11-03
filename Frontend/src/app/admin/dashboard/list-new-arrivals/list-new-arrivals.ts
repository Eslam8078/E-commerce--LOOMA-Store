import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IProduct } from '../../../core/models/product.model';
@Component({
  selector: 'app-list-new-arrivals',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './list-new-arrivals.html',
  styleUrl: './list-new-arrivals.css',
})
export class ListNewArrivals {
  @Input() products: IProduct[] = [];
  @Input() staticURL = "";

  image(images: string[] | undefined): string {
    if (!images?.length) return "";
    return /^https?:\/\//i.test(images[0]) ? images[0] : `${this.staticURL}${images[0]}`;
  }
}
