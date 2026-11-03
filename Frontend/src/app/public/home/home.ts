import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../core/services/report.service';
import { TestimonialService } from '../../core/services/testimonial.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { IProduct } from '../../core/models/product.model';
import { Testimonial } from '../../core/models/testimonial.model';
import { environment } from '../../../environment/env';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  newArrivals: IProduct[] = [];
  bestSellers: IProduct[] = [];
  testimonials: Testimonial[] = [];
  isLoading = true;
  feedback = '';
  feedbackKind: 'success' | 'error' = 'success';
  readonly staticURL = environment.staticURL;

  readonly categories = [
    { name: 'Women', note: 'Thoughtful silhouettes', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=850&q=88' },
    { name: 'Men', note: 'Modern everyday layers', image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=850&q=88' },
    { name: 'Accessories', note: 'The finishing touch', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=850&q=88' },
    { name: 'Kids', note: 'Made for little moments', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=850&q=88' },
  ];

  constructor(
    private dashboardService: DashboardService,
    private testimonialService: TestimonialService,
    public authService: AuthService,
    private cartService: CartService,
    public wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.dashboardService.getNewArrivals(8).subscribe({
      next: (response) => {
        this.newArrivals = response.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.newArrivals = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });

    this.dashboardService.getBestSellers(8).subscribe({
      next: (response) => {
        this.bestSellers = response.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.bestSellers = [];
        this.cdr.detectChanges();
      },
    });

    this.testimonialService.getApprovedTestimonials({ limit: 6 }).subscribe({
      next: (response) => {
        this.testimonials = response.data || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.testimonials = [];
        this.cdr.detectChanges();
      },
    });
  }

  image(images: string[] | undefined): string {
    if (!images?.length) return '';
    return /^https?:\/\//i.test(images[0]) ? images[0] : `${this.staticURL}${images[0]}`;
  }

  stars(rating: number): number[] {
    return Array(Math.max(0, Math.min(5, Math.round(rating)))).fill(0);
  }

  testimonialName(testimonial: Testimonial): string {
    return typeof testimonial.userId === 'object' ? testimonial.userId.name : 'LOOMA customer';
  }

  testimonialInitial(testimonial: Testimonial): string {
    return this.testimonialName(testimonial).charAt(0).toUpperCase() || 'L';
  }

  isSaved(product: IProduct): boolean {
    return this.wishlistService.contains(product._id);
  }

  toggleSaved(event: Event, product: IProduct): void {
    event.preventDefault();
    event.stopPropagation();
    const saved = this.wishlistService.toggle(product);
    this.showFeedback(saved ? 'Added to your saved pieces.' : 'Removed from your saved pieces.');
  }

  addToCart(event: Event, product: IProduct): void {
    event.preventDefault();
    event.stopPropagation();

    if (!product.isActive || product.isDeleted || product.stockQuantity < 1) {
      this.showFeedback('This piece is currently unavailable.', 'error');
      return;
    }

    if (this.authService.isCustomer()) {
      this.cartService.addItem(product._id, 1).subscribe({
        next: () => this.showFeedback(`${product.name} added to your bag.`),
        error: (error) => this.showFeedback(error?.error?.message || 'Could not add this item. Please try again.', 'error'),
      });
      return;
    }

    const added = this.cartService.addToGuestCart({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      images: product.images,
      stockQuantity: product.stockQuantity,
    });
    this.showFeedback(added ? `${product.name} added to your bag.` : 'Could not add this item.', added ? 'success' : 'error');
  }

  private showFeedback(message: string, kind: 'success' | 'error' = 'success'): void {
    this.feedback = message;
    this.feedbackKind = kind;
    this.cdr.detectChanges();
  }
}
