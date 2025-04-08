import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../models/product.model';
import {Page} from '../models/page.model';
import {getBasicAuthHeader} from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:8080/product';

  constructor(private http: HttpClient) {}

  getProducts(page: number = 0, size: number = 10): Observable<Page<Product>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<Page<Product>>(this.apiUrl, {
      headers: getBasicAuthHeader(),
      params,
      withCredentials: true
    });
  }

  addNewProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product, {
      headers: getBasicAuthHeader(),
      withCredentials: true
    });
  }

  updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}`, product, {
      headers: getBasicAuthHeader(),
      withCredentials: true
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: getBasicAuthHeader(),
      withCredentials: true
    });
  }
}
