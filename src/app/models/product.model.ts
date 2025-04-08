import {Category} from './category.model';

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  category?: Category;
}
