import {Component, OnInit} from '@angular/core';
import {Product} from '../../models/product.model';
import {Category} from '../../models/category.model';
import {ProductService} from '../../services/product.service';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CategoryService} from '../../services/category.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe
  ]
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];

  currentProduct: Product = this.getEmptyProduct();
  productToDelete: Product | null = null;

  isLoading: boolean = false;
  showForm: boolean = false;
  editMode: boolean = false;
  showDeleteConfirmation: boolean = false;

  successMessage: string = '';
  errorMessage: string = '';

  searchQuery: string = '';
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number | undefined;

  constructor(
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.router.navigate(['/home']);
    this.loadProducts();
    this.loadCategories();
  }

  getEmptyProduct(): Product {
    return {
      name: '',
      description: '',
      price: 0,
      available: true
    };
  }
  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.errorMessage = 'Erro ao carregar categorias.';
      }
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProducts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.products = response.content;
        this.filteredProducts = [...this.products];
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products.';
        this.isLoading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage + 1 < (this.totalPages || 0)) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  getPageRange(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i);
  }

  onAddNewProduct(): void {
    this.editMode = false;
    this.currentProduct = this.getEmptyProduct();
    this.showForm = true;
  }

  onEditProduct(product: Product): void {
    this.editMode = true;
    this.currentProduct = { ...product };
    this.showForm = true;
  }

  onDeleteProduct(product: Product): void {
    this.productToDelete = product;
    this.showDeleteConfirmation = true;
  }

  onCancelDelete(): void {
    this.productToDelete = null;
    this.showDeleteConfirmation = false;
  }

  onConfirmDelete(): void {
    if (!this.productToDelete || !this.productToDelete.id) return;

    this.isLoading = true;
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.showSuccess('Product deleted');
        this.loadProducts();
      },
      error: () => {
        this.errorMessage = 'Failed to delete product';
        this.isLoading = false;
      },
      complete: () => {
        this.showDeleteConfirmation = false;
        this.productToDelete = null;
      }
    });
  }

  onSubmitProduct(): void {
    this.isLoading = true;
    const request$ = this.editMode && this.currentProduct.id
      ? this.productService.updateProduct(this.currentProduct.id, this.currentProduct)
      : this.productService.addNewProduct(this.currentProduct);

    request$.subscribe({
      next: () => {
        this.showSuccess(this.editMode ? 'Product updated' : 'Product created');
        this.loadProducts();
        this.onCancelEdit();
      },
      error: () => {
        this.errorMessage = 'Failed to save product';
        this.isLoading = false;
      }
    });
  }

  onCancelEdit(): void {
    this.showForm = false;
    this.currentProduct = this.getEmptyProduct();
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    this.filteredProducts = this.products.filter(product => {
      const q = this.searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q)
      );
    });
    this.sortProducts();
  }

  sortProducts(): void {
    this.filteredProducts.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortField) {
        case 'id':
          valueA = a.id ?? 0;
          valueB = b.id ?? 0;
          break;
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'description':
          valueA = a.description?.toLowerCase() || '';
          valueB = b.description?.toLowerCase() || '';
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'category':
          valueA = a.category?.name.toLowerCase() || '';
          valueB = b.category?.name.toLowerCase() || '';
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }

      return this.sortDirection === 'asc' ? valueA > valueB ? 1 : -1 : valueA < valueB ? 1 : -1;
    });
  }

  setSortField(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortProducts();
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
