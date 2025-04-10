// src/app/services/category.service.ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Category} from '../models/category.model';
import {getBasicAuthHeader} from './auth.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = 'http://localhost:8080/product/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl, {
      headers: getBasicAuthHeader(),
      withCredentials: true
    });
  }
}
