import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';

import { IProduct } from '../../../core/models/product.model';
import { ICategory } from '../../../core/models/category.model';
import { ISubCategory } from '../../../core/models/subcategory.model';
import { SubCategoryService } from '../../../core/services/subcategory.service';

import { environment } from '../../../../environment/env';

@Component({
  selector: 'app-list-products',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './list-products.html',
  styleUrl: './list-products.css',
})
export class ListProducts implements OnInit {
  products: IProduct[] = [];
  categories: ICategory[] = [];
  search = '';
  requestedCategory = '';
  categoriesLoaded = false;
  categoryId = '';
  subCategoryId = '';
  season = '';
  subcategories: ISubCategory[] = [];
  page = 1;
  totalPages = 1;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  readonly staticURL = environment.staticURL;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cartService: CartService,
    private subcategoryService: SubCategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private wishlistService: WishlistService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.route.queryParamMap.subscribe((params) => {
      this.search = params.get('search') || '';
      this.requestedCategory = params.get('category') || '';
      this.page = 1;
      this.applyRouteFilters();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories({ limit: 50 }).subscribe({
      next: (response) => {
        this.categories = response.data || [];
        this.categoriesLoaded = true;
        this.applyRouteFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [];
        this.categoriesLoaded = true;
        this.applyRouteFilters();
        this.cdr.detectChanges();
      },
    });
  }

  private applyRouteFilters(): void {
    if (!this.categoriesLoaded) return;
    this.categoryId = this.requestedCategory
      ? this.categories.find((category) => category.name.toLowerCase() === this.requestedCategory.toLowerCase())?._id || ''
      : '';
    this.subCategoryId = '';
    this.subcategories = [];
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getProducts({
      page: this.page,
      limit: 12,
      search: this.search.trim() || undefined,
      categoryId: this.categoryId || undefined,
      subCategoryId: this.subCategoryId || undefined,
      season: this.season || undefined,
    }).subscribe({
      next: (response) => {
        this.products = response.data || [];
        this.totalPages = response.pagination?.totalPages || response.pages || 1;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load products';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onCategoryChange(): void {
    this.subCategoryId = '';
    this.subcategories = [];
    this.page = 1;

    if (!this.categoryId) {
      this.load();
      return;
    }

    this.subcategoryService.getSubCategories({ categoryId: this.categoryId, limit: 100 }).subscribe({
      next: (response) => {
        this.subcategories = response.data || [];
        this.cdr.detectChanges();
        this.load();
      },
      error: () => {
        this.load();
      },
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.page = page;
    this.load();
  }

  isSaved(product: IProduct): boolean {
    return this.wishlistService.contains(product._id);
  }

  toggleSaved(event: Event, product: IProduct): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggle(product);
    this.cdr.detectChanges();
  }

  image(images: string[]): string {
    return images?.length ? (/^https?:\/\//i.test(images[0]) ? images[0] : `${this.staticURL}${images[0]}`) : '';
  }

  viewProduct(product: IProduct): void {
    this.router.navigate(['/products', product.slug]);
  }

  addToCart(event: Event, product: IProduct): void {
    event.stopPropagation();

    if (!product.isActive || product.isDeleted || product.stockQuantity < 1) {
      this.errorMessage = 'This product is not available';
      return;
    }

    this.errorMessage = '';

    if (!this.authService.isAuthenticated()) {
      const added = this.cartService.addToGuestCart(
        {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          stockQuantity: product.stockQuantity,
        },
        1,
      );

      this.successMessage = added
        ? `${product.name} added to cart`
        : 'Unable to add this product to cart';

      this.cdr.detectChanges();
      return;
    }

    if (!this.authService.isCustomer()) {
      this.errorMessage = 'You cannot add products to cart';
      this.cdr.detectChanges();
      return;
    }

    this.cartService.addItem(product._id, 1).subscribe({
      next: () => {
        this.successMessage = `${product.name} added to cart`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Failed to add product to cart';
        this.cdr.detectChanges();
      },
    });
  }
}
