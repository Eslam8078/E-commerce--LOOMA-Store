import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  cartCount = 0;
  unreadCount = 0;
  menuOpen = false;
  wishlistCount = 0;
  searchTerm = '';
  searchOpen = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private wishlistService: WishlistService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.wishlistService.items$.subscribe((items) => {
      this.wishlistCount = items.length;
      this.cdr.detectChanges();
    });

    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (this.authService.isCustomer()) {
      this.cartService.getCart().subscribe();
    }

    this.notificationService.getMyNotifications({
      unread: true,
      limit: 1,
    }).subscribe({
      next: (response) => {
        this.unreadCount = response.unreadCount || 0;
        this.cdr.detectChanges();
      },
      error: () => {
        this.unreadCount = 0;
        this.cdr.detectChanges();
      },
    });
  }

  get currentUser() {
    return this.authService.getUser();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
  }

  searchProducts(): void {
    const term = this.searchTerm.trim();
    this.menuOpen = false;
    this.searchOpen = false;
    this.router.navigate(['/products/list'], { queryParams: term ? { search: term } : {} });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
